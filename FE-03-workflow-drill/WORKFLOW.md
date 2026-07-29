\# WORKFLOW.md — FE-03 AI-Assisted Workflow Drill



\## Round 1 (vague prompt)



\*\*What I typed:\*\* "build me a settings form with validation" — one sentence, no framework, no field list, no constraints.



\*\*What it produced:\*\* A fully working React component (useState, Tailwind classes, lucide-react icons) with display name, email, username, bio, password, confirm password, and two notification checkboxes. Validation covered required fields, email format, username pattern, password complexity, and password match. It even included a show/hide password toggle and a loading state on submit — far more polished than a one-line prompt would suggest was possible.



\*\*What was missing:\*\*

\- Stack was entirely the AI's choice. I never mentioned React, Tailwind, or lucide-react — the prompt left every technical decision up to the model.

\- No accessibility wiring. There was no aria-invalid or aria-describedby on any input. A screen reader user tabbing into a broken field would get no indication anything was wrong — the error was purely a red line of visual text.

\- No focus management on failed submit. When validation failed, handleSubmit just returned early. Nothing moved the user's attention to the first broken field, sighted or not.



\## Round 2 (precise prompt)



\*\*What I typed:\*\* A structured prompt specifying the same field list (to keep the comparison fair), the same stack (React + Tailwind + lucide-react), explicit validation-timing rules (errors only after blur or submit), explicit accessibility requirements (aria-invalid, aria-describedby, focus moves to the first invalid field on failed submit), and a verification instruction: write tests for five specific scenarios, run them, and fix anything that fails before returning the result.



\*\*What the verification step caught:\*\* The AI's first response reported "5/5 tests passed" — but its own transparency note admitted this wasn't run against my real project setup. Because its sandbox had no network access, it simulated the test behavior using a different toolchain (Playwright + esbuild) instead of the actual Vitest/React Testing Library stack the test file was written for. When I actually installed the real dependencies and ran npx vitest run myself, 2 of 5 tests failed.



The cause wasn't a bug in the component — it was an ambiguous regex in the test file itself. screen.getByLabelText(/email/i) matched two elements ("Email" and "Marketing emails," since both contain the substring "email"), which crashed the test with a "found multiple elements" error. The fix was anchoring the regex: /email/i to /^email$/i, so it only matches the exact label text. After that fix, all 5 tests passed for real.



\## Comparison



\- \*\*Correctness:\*\* Round 1 "looked" correct but was never verified against any test — I only found its gaps by manually reading the code. Round 2 came with tests, but the tests themselves initially had a bug, which real verification caught and Round 1 never had the chance to.

\- \*\*Accessibility:\*\* Round 1 had zero accessibility wiring (no aria-invalid, no aria-describedby, no focus-on-error). Round 2 had all three, because I asked for them explicitly in the prompt — accessibility didn't happen by default in either round, it happened because I specified it.

\- \*\*Edge cases:\*\* Round 1's validation logic was reasonable but untested, so I have no real confidence it handles edge cases like whitespace-only input or very long strings correctly. Round 2's test suite explicitly exercises empty submit, invalid email, weak password, mismatched passwords, and a valid full submission.

\- \*\*Review effort:\*\* Round 1 took seconds to "produce" but I hadn't actually verified any of it — the real review work still had to happen, I just hadn't done it yet. Round 2 took longer up front (writing the prompt, setting up npm/vitest/jsdom from scratch) but the verification step surfaced a real bug before I would have shipped it, and once fixed, gave me tests I can trust and re-run in the future. Round 2 felt slower in the moment but was actually more finished at the end.



\## The AI mistake I caught



The AI reported "5/5 tests passed" in its summary, but that result came from a simulated environment, not my actual project dependencies. When I ran the real tests, 2 failed due to an ambiguous label-matching regex in the test file (/email/i matching both "Email" and "Marketing emails"). The component itself was correct — the bug was in the AI-written test code, and I only caught it because I insisted on running verification myself instead of trusting the AI's self-reported result.

