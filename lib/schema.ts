export const SCHEMA = `
Tables:
- workers(id, name, team, email, manager_id)
- persons(id, name, dob, nhs_number, address)
- cases(id, person_id, worker_id, case_type,
        status, open_date, close_date,
        risk_level, last_contact)
- safeguarding_alerts(id, case_id, alert_type,
                      alert_date, resolved)
- assessments(id, case_id, type, date_completed,
              outcome, risk_score)
`;