# Relay Operations — Brand Book v0.1

Relay Operations is the temporary portfolio brand for the white-label customer operations platform. A customer deployment can replace the product name, logo, and accent color without changing the core interface.

## Brand idea

Relay means moving a customer request to the right person, data, policy, and next action. The brand should feel calm, useful, and operational — never theatrical or overly AI-focused.

## Logo

Use `design/relay-mark.svg` for the product mark. The mark is an original project asset and can be used as an app icon, favicon, or navigation mark.

Do:

- keep clear space around the mark;
- use the dark mark on light surfaces and the light mark on dark surfaces;
- replace the mark through tenant branding configuration for customer deployments.

Do not:

- use the mark as a decorative background;
- stretch, rotate, or add effects to it;
- present `Relay Operations` as the customer's brand in a white-label deployment.

## Color tokens

The interface uses warm amber as the brand accent and reserves semantic colors for system states.

### Light theme

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F8FAFC` | App background |
| `surface` | `#FFFFFF` | Main work surfaces |
| `surface-subtle` | `#F1F4F6` | Secondary areas |
| `ink` | `#18212B` | Primary text |
| `ink-muted` | `#66727D` | Secondary text |
| `border` | `#DCE2E7` | Dividers and inputs |
| `brand` | `#D97706` | Primary actions and active states |
| `brand-hover` | `#B45309` | Hover state |
| `brand-secondary` | `#0F766E` | Secondary actions and selected context |

### Dark theme

| Token | Value | Use |
|---|---|---|
| `canvas` | `#10161D` | App background |
| `surface` | `#18212B` | Main work surfaces |
| `surface-subtle` | `#202B36` | Secondary areas |
| `ink` | `#F2F5F7` | Primary text |
| `ink-muted` | `#AAB5BE` | Secondary text |
| `border` | `#33414D` | Dividers and inputs |
| `brand` | `#F59E0B` | Primary actions and active states |
| `brand-hover` | `#FBBF24` | Hover state |
| `brand-secondary` | `#2DD4BF` | Secondary actions and selected context |

### Semantic colors

- Success: `#238A59`
- Warning: `#B7791F`
- Danger: `#C44B4B`
- Info: `#4263EB`

Semantic colors communicate state only. They are not decorative accents.

## Typography

- Primary font: Inter, with a system sans-serif fallback.
- Body: 14–16px, line height 1.45–1.6.
- Page title: 24–28px, semibold.
- Section title: 16–18px, semibold.
- Metadata: 12–13px, medium.

Avoid all-caps labels, excessive font weights, and long text inside dense controls.

## Iconography

Use Lucide icons for interface actions with a consistent 1.75px stroke and 18px default size. Lucide is free for commercial and personal use under the ISC License; retain its license notice in the frontend package.

Use the custom Relay mark only for brand identity. Do not use generic interface icons as a logo.

## Layout principles

- Keep the operator's current conversation as the visual focus.
- Use a compact queue, not a dashboard full of metric cards.
- Keep customer and order context one click away or in a collapsible side panel.
- Give each screen one primary action.
- Support English, Polish, German, and Spanish without assuming text length from English.
- The language switcher and theme switcher belong in the global header.

## White-label configuration

The following values should become tenant settings later:

```json
{
  "product_name": "Relay Operations",
  "logo_url": "/branding/logo.svg",
  "brand_color": "#D97706",
  "brand_secondary_color": "#0F766E",
  "default_locale": "en",
  "supported_locales": ["en", "pl", "de", "es"],
  "default_theme": "system"
}
```
