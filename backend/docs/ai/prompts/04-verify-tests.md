សរសេរ Jest + Supertest Test សម្រាប់ US-01 (ផ្នែក Backend)។
មួយ Test ក្នុងមួយ Scenario ដាក់ឈ្មោះ "US-01 S2: ...", "US-01 S3: ..."។
គ្របដណ្តប់៖ Happy path, language មិនត្រឹមត្រូវ (ឧ. "fr" ត្រូវបដិសេធ),
language ទទេ (Fallback km), Unauthorized (គ្មាន Token), Login ត្រឡប់ language។
ផ្តល់ Setup ដែលត្រូវការ (Test DB, Auth token helper)។