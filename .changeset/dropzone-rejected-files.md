---
"@nexum-io/design-system": patch
---

`FileDropzone` now says why a file was not added. A file of a type that is not accepted, a file over the size limit and a selection over the file limit used to be dropped with no visible feedback unless the caller passed `onReject`. The reasons of the last selection are now listed under the drop area (`role="alert"`); they go away on the next selection, when a file is removed and when the parent empties a non-empty value. New optional labels `rejectedType`, `rejectedSize` and `rejectedCount` localize the text: the first two follow the rejected file's name, the third is shown on its own, and the English defaults for size and count state the limit. `DisputeThread` and `DisputeEvidencePanel` take them through `labels.dropzone`; `DisputeEvidencePanel` also starts a fresh dropzone after a successful submit. `onReject` is called as before.
