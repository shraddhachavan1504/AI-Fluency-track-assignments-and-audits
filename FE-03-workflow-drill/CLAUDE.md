\# CLAUDE.md — Project Rules



1\. Form inputs must show validation errors only after the field is blurred or the form is submitted — never on every keystroke. (Found in Round 1: vague prompts still got this right by default, but it should be a stated rule, not an accident.)



2\. Every invalid input must have aria-invalid="true" and aria-describedby pointing at its error message's id. On failed submit, focus must move to the first invalid field. (Round 1 had neither — a screen reader user would get no signal that anything was wrong.)



3\. Never trust an AI's self-reported test results without running them yourself against the real project dependencies. (Round 2: Claude reported "5/5 tests passed" from a simulated environment; the real run against actual vitest/RTL found 2 failing tests caused by an ambiguous regex in the test file itself.)

