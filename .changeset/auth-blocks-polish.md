---
"@nexum-io/design-system": patch
---

Auth blocks polish. `NexumIdQrPanel` resyncs its countdown when the `waiting` phase starts (it could show up to 1 s too much right after `creating`) and ignores a clipboard write that resolves after unmount. `DummyAccountList`'s default `formatAddress` is documented as `formatShortAddress(address, 8, 6)`, so cabinets can drop their inline lambda.
