---
name: dispatching-parallel-agents
description: Use for two or more bounded tasks with independent inputs, state, and safe concurrent workspaces.
---

# Dispatching Parallel Agents

Establish independence before delegation: one result must not depend on another,
and workers must not compete for files, shared state, or external resources.
Related failures or unclear causes need joint investigation first.

For each independent domain, write one bounded prompt containing its goal,
requirements, applicable constraints, relevant artifact paths, owned scope,
expected evidence, and report format. Use
[dispatch-contract.md](../using-superpowers/references/dispatch-contract.md)
and the active runtime mapping. Preserve the user's explicit model choice.

Request isolated context with no inherited controller turns. Investigations
use read-only review; concurrent writers require verified isolated workspaces.
Never run parallel writers in one shared checkout. When isolation or safe
workspace realization cannot be proven, disclose the limit and proceed
sequentially or use the owning workflow's fallback.

Inspect every returned report and actual change, resolve conflicts, review
the integration, and run applicable combined checks. Passing isolated checks
alone does not establish that the integrated result meets the requirements.
