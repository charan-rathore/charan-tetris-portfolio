# Delivery workflow

The user requests continuous GitHub progress: commit and push each small, successfully verified feature or fix before starting the next increment. Run checks appropriate to the change, keep commits focused, and verify production after deployment. Do not include secrets, temporary debug probes, or unrelated work.

This checkout is the production portfolio source. `../tetris-style` is an older checkout with separate unfinished debugging work; do not overwrite either checkout from the other.
