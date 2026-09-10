# Preview URL Directives

The CLDT editor supports special comment directives and configuration files that allow you to control how preview URLs are constructed. This is useful when you want to work with transformations only and have the editor automatically build the complete Cloudinary URL.

## Configuration Methods

You can configure the preview URL in two ways:

1. **`.cldtrc.json` file** - Place a configuration file in the same directory as your `.cldt` file
2. **Inline annotations** - Use special comments in your `.cldt` file (these override `.cldtrc.json` settings)

---

## `.cldtrc.json` Configuration File

Create a `.cldtrc.json` file in the same directory as your `.cldt` files to set default configuration that applies to all files in that directory.

### Example `.cldtrc.json`:

```json
{
  "cloudName": "demo",
  "publicId": "sample.jpg",
  "prefix": "https://res.cloudinary.com/demo/image/upload/",
  "suffix": "/v0/sample.jpg"
}
```

### Supported Properties:

- `cloudName` or `cloud-name` - Your Cloudinary cloud name
- `publicId` or `public-id` - The public ID of the asset
- `prefix` - Base URL prefix
- `suffix` - URL suffix (version and public ID)

**Note:** Inline annotations in your `.cldt` file will override settings from `.cldtrc.json`.

---

## Available Directives (Inline Annotations)

### `@cld/prefix`

Specifies the base URL prefix that will be prepended to your transformations.

**Syntax:**

```
# @cld/prefix <BASE_URL>
```

**Example:**

```
# @cld/prefix https://res.cloudinary.com/demo/image/upload/
w_500/
h_300/
c_fill/
```

**Result:** `https://res.cloudinary.com/demo/image/upload/w_500/h_300/c_fill/`

---

### `@cld/suffix`

Specifies the suffix (typically the public ID and version) that will be appended to your transformations.

**Syntax:**

```
# @cld/suffix <SUFFIX>
```

**Example:**

```
# @cld/suffix /v0/sample.jpg
w_500/
h_300/
c_fill/
```

**Result:** `w_500/h_300/c_fill/v0/sample.jpg`

---

### `@cld/cloud-name`

Specifies the Cloudinary cloud name for building standard Cloudinary URLs.

**Syntax:**

```
# @cld/cloud-name <CLOUD_NAME>
```

**Must be used with:** `@cld/public-id`

---

### `@cld/public-id`

Specifies the public ID of the asset.

**Syntax:**

```
# @cld/public-id <PUBLIC_ID>
```

**Must be used with:** `@cld/cloud-name`

---

## Usage Patterns

### Pattern 1: Prefix + Suffix (Most Flexible)

Use both prefix and suffix when you want full control over the URL structure.

```
# @cld/prefix https://res.cloudinary.com/demo/image/upload/
# @cld/suffix /v0/sample.jpg

w_500/
h_300/
c_fill/
g_auto/
```

**Generated URL:**

```
https://res.cloudinary.com/demo/image/upload/w_500/h_300/c_fill/g_auto/v0/sample.jpg
```

---

### Pattern 2: Cloud Name + Public ID (Standard Cloudinary Format)

The editor will automatically construct a standard Cloudinary URL with the format:
`https://res.cloudinary.com/<CLOUD_NAME>/image/upload/<TRANSFORMATION>/v0/<PUBLIC_ID>`

```
# @cld/cloud-name demo
# @cld/public-id sample.jpg

w_500/
h_300/
c_fill/
g_auto/
```

**Generated URL:**

```
https://res.cloudinary.com/demo/image/upload/w_500/h_300/c_fill/g_auto/v0/sample.jpg
```

---

### Pattern 3: Prefix Only

Use only the prefix when you want to include version and public ID in your transformation content.

```
# @cld/prefix https://res.cloudinary.com/demo/image/upload/

w_500/
h_300/
c_fill/
v0/
sample.jpg
```

**Generated URL:**

```
https://res.cloudinary.com/demo/image/upload/w_500/h_300/c_fill/v0/sample.jpg
```

---

### Pattern 4: Suffix Only

Use only the suffix when you want to prepend transformations to an existing URL pattern.

```
# @cld/suffix /v0/sample.jpg

w_500/
h_300/
c_fill/
```

**Generated URL:**

```
w_500/h_300/c_fill/v0/sample.jpg
```

---

## Configuration Priority

When both `.cldtrc.json` and inline annotations are present, they are merged with the following priority (highest to lowest):

1. **Inline annotations** (e.g., `# @cld/prefix ...`)
2. **`.cldtrc.json` file**
3. **Default behavior** (no configuration)

This means you can set common defaults in `.cldtrc.json` and override them on a per-file basis using inline annotations.

---

## Usage with `.cldtrc.json`

### Example 1: Using `.cldtrc.json` Only

**`.cldtrc.json`:**

```json
{
  "cloudName": "demo",
  "publicId": "sample.jpg"
}
```

**`my-transformation.cldt`:**

```
w_500/
h_300/
c_fill/
```

**Generated URL:**

```
https://res.cloudinary.com/demo/image/upload/w_500/h_300/c_fill/v0/sample.jpg
```

---

### Example 2: Override `.cldtrc.json` with Annotations

**`.cldtrc.json`:**

```json
{
  "cloudName": "demo",
  "publicId": "sample.jpg"
}
```

**`my-transformation.cldt`:**

```
# @cld/public-id different-image.jpg

w_500/
h_300/
c_fill/
```

**Generated URL:**

```
https://res.cloudinary.com/demo/image/upload/w_500/h_300/c_fill/v0/different-image.jpg
```

The `cloudName` comes from `.cldtrc.json`, but `publicId` is overridden by the annotation.

---

## Notes

- Directives must be placed in comment lines starting with `#`
- Directives are case-sensitive
- Whitespace after the directive name is flexible
- `.cldtrc.json` must be in the same directory as the `.cldt` file
- `.cldtrc.json` supports both camelCase (`cloudName`) and kebab-case (`cloud-name`) property names
- If no configuration is found, the editor falls back to the original behavior (joining all non-comment lines)
- Regular comments (without directives) are still supported and will be ignored in the URL construction
- Transformation lines with trailing slashes will have them removed during URL construction

## Examples Directory

See the `examples/` directory for working examples:

- `directive-prefix-suffix.cldt` - Using prefix and suffix annotations
- `directive-cloud-name.cldt` - Using cloud-name and public-id annotations
- `directive-prefix-only.cldt` - Using only prefix annotation
- `with-config-only.cldt` - Using `.cldtrc.json` configuration only
- `with-config-override.cldt` - Using `.cldtrc.json` with annotation override
- `.cldtrc.json` - Example configuration file
