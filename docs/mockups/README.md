# Design visuals — sources and reading guide

These boards were prepared on October 19, 2026 to document the current application structure. They are retrospective design explanations, not evidence that wireframes existed before implementation.

| Board                                       | Picture source                                                             | What the board explains                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [Overview](overview-wireframe.png)          | Original `overview-concept.png`; illustrative interface and example values | Shared navigation, two independent entry points, and historical-data context                      |
| [Commute dashboard](commutes-wireframe.png) | Manoj’s supplied local-browser screenshot, `image(3).png`                  | Private history, summary metrics, form, weekday chart, buffer explanation, and record maintenance |
| [Transfer board](transfers-wireframe.png)   | Manoj’s supplied local-browser screenshot, `image(4).png`                  | Public/unverified reports, form, feed filters, statistics, and owner-only controls                |
| [Mobile](mobile-wireframe.png)              | Newly drawn responsive wireframes; no device screenshot                    | Intended reading order, layout breakpoints, controls, and remaining checks                        |

The two feature screenshots are partial page captures with browser chrome excluded. User-entered values are test data, not validated transit observations. They predate the pagination/mobile style update and do not establish public deployment or completed mobile testing. The wireframes deliberately simplify fields and content; consult the HTML and acceptance criteria for the full forms.

The [stop-suggestion capture](../screenshots/transfers-live.png) is another local screenshot supplied by Manoj. It shows MBTA reference suggestions in the transfer entry form.

Original concept images remain available as `overview-concept.png`, `commutes-concept.png`, and `transfers-concept.png`. Their example metrics are illustrative. Project-level [AI use](../../README.md#ai-use-disclosure) and [data attribution](../../README.md#data-source-and-attribution) apply to this documentation.
