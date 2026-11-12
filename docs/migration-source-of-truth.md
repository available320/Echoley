# Database migration source-of-truth

The connected Supabase project reported these applied migration versions during the read-only audit:

| Version | Name |
|---|---|
| 20261110185330 | echoley_core_schema |
| 20261110185342 | echoley_private_storage |
| 20261110185434 | lock_down_user_bootstrap_function |
| 20261110190725 | echoley_transcriptions |
| 20261110222803 | add_missing_foreign_key_indexes |
| 20261111065729 | durable_processing_job_leases |
| 20261111081427 | recover_exhausted_processing_jobs |

At the time of that audit, only `20261111065729_durable_processing_job_leases.sql` was present in the branch. The other six historical migration source files were missing.

This is migration-history drift. Do not fabricate historical SQL from the live schema, infer it from table names, or re-run migrations against the connected project. Recover the original reviewed SQL from its author/source, or generate a controlled schema diff in a separate development database and review it independently.

No database schema or migration was changed as part of this code work. The live project remains untouched.
