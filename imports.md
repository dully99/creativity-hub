# Planning Excel Import API

## Endpoints

| # | Endpoint                               | Method | Description                                     |
| - | -------------------------------------- | ------ | ----------------------------------------------- |
| 1 | `/api/v1.0/planning/import/preview/` | POST   | Parse Excel, return JSON preview (no DB writes) |
| 2 | `/api/v1.0/planning/import/`         | POST   | Import Excel into database                      |

## Parameters

| Parameter       | Required          | Description                                      |
| --------------- | ----------------- | ------------------------------------------------ |
| `file`        | Yes               | The`.xlsx` file (multipart form-data)          |
| `budget_type` | Yes (import only) | `development` or `recurring`                 |
| `sheet`       | No                | Only import this sheet name (for chunked import) |
| `dry_run`     | No                | `true` to validate without committing to DB    |

## Excel Format

Each sheet represents a **Division** (sheet name = division code, e.g., `CIA`).

### Columns

| Column          | Maps To                                               |
| --------------- | ----------------------------------------------------- |
| Division        | Division code (sheet name)                            |
| Sub-Vote No.    | Unit code (e.g.,`1004`)                             |
| Sub-Vote Name   | Unit name (e.g.,`Internal Audit Unit`)              |
| Objective Code  | — (not used)                                         |
| Objective ID    | — (not used)                                         |
| Objective Name  | `Objective.name` (shared across divisions)          |
| Target Code     | — (not used)                                         |
| Target ID       | — (not used)                                         |
| Target Name     | `Target.name`                                       |
| Activity Code   | — (auto-generated)                                   |
| Activity ID     | — (not used)                                         |
| Activity Name   | `Activity.name`                                     |
| Project Code    | — (not used)                                         |
| Project Name    | `Project.name` (shared across divisions)            |
| Task ID         | — (not used)                                         |
| Task Name       | `Task.name`                                         |
| Target Category | `Target.data_type` (`number` or `percentage`)   |
| Target Number   | `Target.target_value` / `Task.target_value`       |
| Q1–Q4          | `Task.implementation_quarters` (checked = assigned) |
| Responsible     | — (not stored currently)                             |

### Hierarchy

```
Division (department, e.g., CIA)
  └── Unit (e.g., Internal Audit Unit, code=1004)
        └── Target (objective + unit, unique)
              └── Activity (target + name, unique)
                    └── Task (activity + name, unique)
```

- **Project** and **Objective** are shared across divisions (linked via `DivisionProject` and `DivisionObjective` junction tables).
- **Target** is unique per `(objective, responsible_division=unit)`.
- **Activity** is unique per `(target, name)`.
- **Task** is unique per `(activity, name)`.

## Import Logic

- **FinancialYear**: Looks for an active (`is_current=True`) FY linked to an active `ReportingDuration`. Falls back to any existing FY, then creates one if none found.
- **ReportingDuration**: Looks for an active (`status=active`) duration for the ministry. Falls back to any, then creates one if none found.
- **BudgetType**: Must be specified by the caller (`development` or `recurring`).
- **Quarters**: Q1–Q4 are auto-created for the financial year if they don't exist.
- **Dry run**: Uses `transaction.atomic()` with rollback — validates everything but commits nothing.
- **Idempotent**: Running the same file twice creates 0 new records (all entities use `get_or_create`).

## Examples

### 1. Preview only (parse Excel, no DB writes)

```bash
curl -X POST http://127.0.0.1:8086/api/v1.0/planning/import/preview/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@docs/MCIT_Dev_ActionPlan_Followup (1).xlsx"
```

### 2. Dry run — validate, no commit (all sheets)

```bash
curl -X POST http://127.0.0.1:8086/api/v1.0/planning/import/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@docs/MCIT_Dev_ActionPlan_Followup (1).xlsx" \
  -F "budget_type=development" \
  -F "dry_run=true"
```

### 3. Dry run — single sheet only

```bash
curl -X POST http://127.0.0.1:8086/api/v1.0/planning/import/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@docs/MCIT_Dev_ActionPlan_Followup (1).xlsx" \
  -F "budget_type=development" \
  -F "sheet=DISS" \
  -F "dry_run=true"
```

### 4. Full import — all sheets, commit to DB

```bash
curl -X POST http://127.0.0.1:8086/api/v1.0/planning/import/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@docs/MCIT_Dev_ActionPlan_Followup (1).xlsx" \
  -F "budget_type=development"
```

### 5. Per-sheet import (chunked, commit to DB)

```bash
curl -X POST http://127.0.0.1:8086/api/v1.0/planning/import/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@docs/MCIT_Dev_ActionPlan_Followup (1).xlsx" \
  -F "budget_type=development" \
  -F "sheet=DISS"
```

### 6. Recurring budget import

```bash
curl -X POST http://127.0.0.1:8086/api/v1.0/planning/import/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@docs/MCIT_Recurring_ActionPlan.xlsx" \
  -F "budget_type=recurring"
```

## Response Format

### Success

```json
{
  "success": true,
  "error": false,
  "message": "Import completed successfully",
  "data": {
    "created": {
      "divisions": 16,
      "projects": 596,
      "objectives": 9,
      "targets": 25,
      "activities": 192,
      "tasks": 804,
      "quarters": 4
    },
    "skipped": 0,
    "errors": []
  }
}
```

### Dry run

```json
{
  "success": true,
  "error": false,
  "message": "Dry run completed — no records were committed",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": true,
  "message": "Parameter 'budget_type' is required. Use 'development' or 'recurring'.",
  "data": null
}
```

## Management Commands

### Clear all planning data (for re-testing)

```bash
python manage.py clear_planning_data
```

Deletes all Tasks, Activities, Targets, Objectives, Projects, Quarters, FinancialYears, DivisionProject/DivisionObjective links, and auto-created Divisions/Units.
