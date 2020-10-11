# Components

This directory is responsible for containing all components to be
displayed within the various different screens. This directory is broken
up into subdirectories based on the respective screens that the
components relate to. Components in this directory should contain as
little business logic as possible and instead be used for presentation.

It is worth noting that the presentation layer may perform callbacks to
the business or data layer in order to invoke changes upstream. However,
ideally the components should contain as little state as possible. This
logic should be handled upstream within the respective screens.
