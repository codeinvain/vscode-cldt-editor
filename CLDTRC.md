# .cldtrc.json Configuration File

The `.cldtrc.json` file allows you to set default Cloudinary URL configuration for all `.cldt` files in the same directory.

## File Location

Place the `.cldtrc.json` file in the same directory as your `.cldt` transformation files.

```
my-project/
  ├── .cldtrc.json          # Configuration file
  ├── transformation1.cldt   # Uses config from .cldtrc.json
  ├── transformation2.cldt   # Uses config from .cldtrc.json
  └── transformation3.cldt   # Uses config from .cldtrc.json
```

## Configuration Schema

```json
{
  "prefix": "string (optional)",
  "suffix": "string (optional)",
  "cloudName": "string (optional)",
  "publicId": "string (optional)"
}
```

### Properties

#### `prefix` (optional)

Base URL that will be prepended to your transformations.

**Example:**

```json
{
  "prefix": "https://res.cloudinary.com/demo/image/upload/"
}
```

#### `suffix` (optional)

Suffix that will be appended to your transformations (typically version and public ID).

**Example:**

```json
{
  "suffix": "/v0/sample.jpg"
}
```

#### `cloudName` (optional)

Your Cloudinary cloud name. Can also be written as `cloud-name`.

**Example:**

```json
{
  "cloudName": "demo"
}
```

**Alternative format:**

```json
{
  "cloud-name": "demo"
}
```

#### `publicId` (optional)

The public ID of your Cloudinary asset. Can also be written as `public-id`.

**Example:**

```json
{
  "publicId": "sample.jpg"
}
```

**Alternative format:**

```json
{
  "public-id": "sample.jpg"
}
```

## Configuration Combinations

### Option 1: Prefix + Suffix

Most flexible approach. Use when you want complete control.

```json
{
  "prefix": "https://res.cloudinary.com/demo/image/upload/",
  "suffix": "/v0/sample.jpg"
}
```

**Result:** `<prefix><transformations><suffix>`

### Option 2: Cloud Name + Public ID

Standard Cloudinary URL format. The editor automatically constructs the URL.

```json
{
  "cloudName": "demo",
  "publicId": "sample.jpg"
}
```

**Result:** `https://res.cloudinary.com/<cloudName>/image/upload/<transformations>/v0/<publicId>`

### Option 3: Prefix Only

Use when you want to include version/public ID in your transformation file.

```json
{
  "prefix": "https://res.cloudinary.com/demo/image/upload/"
}
```

### Option 4: Suffix Only

Use when you want to prepend transformations dynamically.

```json
{
  "suffix": "/v0/sample.jpg"
}
```

## Overriding Configuration

Inline annotations in your `.cldt` files will override settings from `.cldtrc.json`:

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
```

**Result:** Uses `cloudName` from `.cldtrc.json` but `publicId` from the annotation.

## Examples

See the `examples/` directory for working examples:

- `examples/.cldtrc.json` - Example configuration file
- `examples/with-config-only.cldt` - Using config file only
- `examples/with-config-override.cldt` - Overriding config with annotations

## Error Handling

- If `.cldtrc.json` is not found, the editor will use only inline annotations or default behavior
- If `.cldtrc.json` contains invalid JSON, the error is logged to the console and the file is ignored
- Missing or invalid properties in `.cldtrc.json` are silently ignored

## Best Practices

1. **Use `.cldtrc.json` for shared configuration** across multiple transformation files
2. **Use inline annotations for file-specific overrides**
3. **Add `.cldtrc.json` to version control** if the configuration is project-specific
4. **Add `.cldtrc.json` to `.gitignore`** if it contains sensitive or environment-specific information
5. **Use camelCase properties** for consistency with JavaScript conventions (both formats are supported)
