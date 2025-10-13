import * as vscode from "vscode";

export class CldtHoverProvider implements vscode.HoverProvider {
  private documentation: Map<string, { desc: string; example?: string; alias?: string }>;

  constructor() {
    this.documentation = new Map([
      // Main transformation parameters (with abbreviations)
      ["width", { desc: "Sets the width of the transformed asset in pixels", example: "width: 300", alias: "w" }],
      ["w", { desc: "Sets the width of the transformed asset in pixels (abbreviation for width)", example: "w: 300", alias: "width" }],

      ["height", { desc: "Sets the height of the transformed asset in pixels", example: "height: 200", alias: "h" }],
      ["h", { desc: "Sets the height of the transformed asset in pixels (abbreviation for height)", example: "h: 200", alias: "height" }],

      ["crop", { desc: "Determines how to crop or resize the image", example: "crop: fill", alias: "c" }],
      ["c", { desc: "Determines how to crop or resize the image (abbreviation for crop)", example: "c: fill", alias: "crop" }],

      ["gravity", { desc: "Determines which part of the image to focus on when cropping", example: "gravity: face", alias: "g" }],
      ["g", { desc: "Determines which part of the image to focus on when cropping (abbreviation for gravity)", example: "g: face", alias: "gravity" }],

      ["quality", { desc: "Controls the compression quality (1-100 or auto)", example: "quality: auto:best", alias: "q" }],
      ["q", { desc: "Controls the compression quality (abbreviation for quality)", example: "q: auto:best", alias: "quality" }],

      ["format", { desc: "Sets the output format of the asset", example: "format: webp", alias: "f" }],
      ["f", { desc: "Sets the output format of the asset (abbreviation for format)", example: "f: webp", alias: "format" }],

      ["angle", { desc: "Rotates or flips the asset by the specified degrees", example: "angle: 90", alias: "a" }],
      ["a", { desc: "Rotates or flips the asset by the specified degrees (abbreviation for angle)", example: "a: 90", alias: "angle" }],

      ["border", { desc: "Adds a border around the image", example: "border: 5px_solid_black", alias: "bo" }],
      ["bo", { desc: "Adds a border around the image (abbreviation for border)", example: "bo: 5px_solid_black", alias: "border" }],

      ["radius", { desc: "Rounds the corners of the image or makes it circular", example: "radius: 20", alias: "r" }],
      ["r", { desc: "Rounds the corners of the image (abbreviation for radius)", example: "r: 20", alias: "radius" }],

      ["effect", { desc: "Applies various effects and filters to the asset", example: "effect: blur:300", alias: "e" }],
      ["e", { desc: "Applies various effects and filters (abbreviation for effect)", example: "e: blur:300", alias: "effect" }],

      ["opacity", { desc: "Sets the opacity level (0-100)", example: "opacity: 50", alias: "o" }],
      ["o", { desc: "Sets the opacity level (abbreviation for opacity)", example: "o: 50", alias: "opacity" }],

      ["overlay", { desc: "Adds an overlay layer on top of the image", example: "overlay: logo", alias: "l" }],
      ["l", { desc: "Adds a layer (overlay) on top of the image (abbreviation for overlay)", example: "l: logo", alias: "overlay" }],
      ["fl_layer_apply", { desc: "Applies the layer to the image", example: "fl_layer_apply" }],

      ["underlay", { desc: "Adds an underlay layer beneath the image", example: "underlay: background", alias: "u" }],
      ["u", { desc: "Adds an underlay layer beneath the image (abbreviation for underlay)", example: "u: background", alias: "underlay" }],

      ["color", { desc: "Sets a color value (for text, border, background, etc.)", example: "color: rgb:FF0000", alias: "co" }],
      ["co", { desc: "Sets a color value (abbreviation for color)", example: "co: rgb:FF0000", alias: "color" }],

      ["background", { desc: "Sets the background color for transparent areas", example: "background: white", alias: "b" }],
      ["b", { desc: "Sets the background color (abbreviation for background)", example: "b: white", alias: "background" }],

      ["zoom", { desc: "Controls zoom level for face/custom coordinate detection", example: "zoom: 2.0", alias: "z" }],
      ["z", { desc: "Controls zoom level (abbreviation for zoom)", example: "z: 2.0", alias: "zoom" }],

      ["aspect_ratio", { desc: "Sets the aspect ratio of the asset", example: "aspect_ratio: 16:9", alias: "ar" }],
      ["ar", { desc: "Sets the aspect ratio (abbreviation for aspect_ratio)", example: "ar: 16:9", alias: "aspect_ratio" }],

      ["dpr", { desc: "Device pixel ratio for high-DPI displays (1.0-3.0 or auto)", example: "dpr: 2.0" }],

      ["x", { desc: "X-coordinate for cropping or overlay positioning", example: "x: 100" }],
      ["y", { desc: "Y-coordinate for cropping or overlay positioning", example: "y: 100" }],

      ["fetch_format", { desc: "Automatically delivers the format best suited for the browser", example: "fetch_format: auto", alias: "f_auto" }],
      ["f_auto", { desc: "Automatically delivers optimal format (abbreviation)", example: "f_auto: true", alias: "fetch_format" }],

      ["density", { desc: "Controls the DPI for converting vector files to raster", example: "density: 150", alias: "dn" }],
      ["dn", { desc: "Controls the DPI for vector conversions (abbreviation for density)", example: "dn: 150", alias: "density" }],

      ["page", { desc: "Specifies which page/layer to extract from multi-page documents", example: "page: 2", alias: "pg" }],
      ["pg", { desc: "Specifies page/layer to extract (abbreviation for page)", example: "pg: 2", alias: "page" }],

      ["delay", { desc: "Controls the delay between frames in animated images (in ms)", example: "delay: 100", alias: "dl" }],
      ["dl", { desc: "Controls delay between frames (abbreviation for delay)", example: "dl: 100", alias: "delay" }],

      ["duration", { desc: "Controls the total duration of a video or animated image", example: "duration: 5.0", alias: "du" }],
      ["du", { desc: "Controls total duration (abbreviation for duration)", example: "du: 5.0", alias: "duration" }],

      ["start_offset", { desc: "Specifies the start time offset for video trimming", example: "start_offset: 2.5", alias: "so" }],
      ["so", { desc: "Specifies start time offset (abbreviation for start_offset)", example: "so: 2.5", alias: "start_offset" }],

      ["end_offset", { desc: "Specifies the end time offset for video trimming", example: "end_offset: 10.5", alias: "eo" }],
      ["eo", { desc: "Specifies end time offset (abbreviation for end_offset)", example: "eo: 10.5", alias: "end_offset" }],

      ["audio_codec", { desc: "Sets the audio codec for video transcoding", example: "audio_codec: aac", alias: "ac" }],
      ["ac", { desc: "Sets audio codec (abbreviation for audio_codec)", example: "ac: aac", alias: "audio_codec" }],

      ["audio_frequency", { desc: "Sets the audio sampling frequency in Hz", example: "audio_frequency: 44100", alias: "af" }],
      ["af", { desc: "Sets audio sampling frequency (abbreviation for audio_frequency)", example: "af: 44100", alias: "audio_frequency" }],

      ["bit_rate", { desc: "Sets the total bit rate for video", example: "bit_rate: 1m", alias: "br" }],
      ["br", { desc: "Sets total bit rate (abbreviation for bit_rate)", example: "br: 1m", alias: "bit_rate" }],

      ["video_codec", { desc: "Sets the video codec for transcoding", example: "video_codec: h264", alias: "vc" }],
      ["vc", { desc: "Sets video codec (abbreviation for video_codec)", example: "vc: h264", alias: "video_codec" }],

      ["fps", { desc: "Sets frames per second for video", example: "fps: 30" }],
      ["keyframe_interval", { desc: "Sets the keyframe interval for video encoding", example: "keyframe_interval: 2.0", alias: "ki" }],
      ["ki", { desc: "Sets keyframe interval (abbreviation for keyframe_interval)", example: "ki: 2.0", alias: "keyframe_interval" }],

      ["streaming_profile", { desc: "Applies a predefined streaming profile", example: "streaming_profile: hd", alias: "sp" }],
      ["sp", { desc: "Applies streaming profile (abbreviation for streaming_profile)", example: "sp: hd", alias: "streaming_profile" }],

      ["default_image", { desc: "Specifies a fallback image if the requested image doesn't exist", example: "default_image: placeholder.jpg", alias: "d" }],
      ["d", { desc: "Specifies fallback image (abbreviation for default_image)", example: "d: placeholder.jpg", alias: "default_image" }],

      // Crop/Resize modes
      ["scale", { desc: "Scales the asset to fit within specified dimensions (changes aspect ratio)", example: "crop: scale" }],
      ["fit", { desc: "Fits the asset within specified dimensions without cropping (maintains aspect ratio)", example: "crop: fit" }],
      ["fill", { desc: "Fills the specified dimensions, cropping if necessary", example: "crop: fill" }],
      ["limit", { desc: "Limits the asset size without upscaling", example: "crop: limit" }],
      ["thumb", { desc: "Creates a thumbnail with automatic face detection", example: "crop: thumb" }],
      ["pad", { desc: "Pads the asset to exact dimensions with a background color", example: "crop: pad" }],
      ["lpad", { desc: "Limits padding - only pads if original is larger", example: "crop: lpad" }],
      ["mpad", { desc: "Pads with minimum padding needed", example: "crop: mpad" }],
      ["lfill", { desc: "Limits fill - only fills if original is smaller", example: "crop: lfill" }],
      ["mfit", { desc: "Fits with minimum size", example: "crop: mfit" }],
      ["imagga_crop", { desc: "Crops using Imagga's content-aware algorithm", example: "crop: imagga_crop" }],
      ["imagga_scale", { desc: "Scales using Imagga's content-aware algorithm", example: "crop: imagga_scale" }],

      // Gravity options
      ["center", { desc: "Centers the image when cropping", example: "gravity: center" }],
      ["north", { desc: "Top center", example: "gravity: north" }],
      ["south", { desc: "Bottom center", example: "gravity: south" }],
      ["east", { desc: "Right center", example: "gravity: east" }],
      ["west", { desc: "Left center", example: "gravity: west" }],
      ["north_east", { desc: "Top right corner", example: "gravity: north_east" }],
      ["north_west", { desc: "Top left corner", example: "gravity: north_west" }],
      ["south_east", { desc: "Bottom right corner", example: "gravity: south_east" }],
      ["south_west", { desc: "Bottom left corner", example: "gravity: south_west" }],
      ["face", { desc: "Focuses on detected faces in the image", example: "gravity: face" }],
      ["faces", { desc: "Focuses on all detected faces", example: "gravity: faces" }],
      ["auto", { desc: "Automatically determines the best gravity based on content", example: "gravity: auto" }],
      ["auto_subject", { desc: "Automatically detects the main subject", example: "gravity: auto:subject" }],
      ["custom", { desc: "Uses custom coordinates specified by x and y", example: "gravity: custom" }],
      ["ocr_text", { desc: "Focuses on detected text in the image", example: "gravity: ocr_text" }],

      // Common Effects (these would be used as effect values)
      ["blur", { desc: "Applies a blur effect (strength 1-2000)", example: "effect: blur:400" }],
      ["grayscale", { desc: "Converts the image to grayscale", example: "effect: grayscale" }],
      ["sepia", { desc: "Applies a sepia tone effect (1-100)", example: "effect: sepia:50" }],
      ["pixelate", { desc: "Pixelates the image (1-200)", example: "effect: pixelate:10" }],
      ["pixelate_faces", { desc: "Pixelates detected faces", example: "effect: pixelate_faces:10" }],
      ["blur_faces", { desc: "Blurs detected faces", example: "effect: blur_faces:1000" }],
      ["blur_region", { desc: "Blurs a specific region", example: "effect: blur_region:1000" }],
      ["cartoonify", { desc: "Applies a cartoon effect", example: "effect: cartoonify" }],
      ["brightness", { desc: "Adjusts the brightness (-99 to 100)", example: "effect: brightness:50" }],
      ["contrast", { desc: "Adjusts the contrast (-100 to 100)", example: "effect: contrast:30" }],
      ["saturation", { desc: "Adjusts color saturation (-100 to 100)", example: "effect: saturation:50" }],
      ["hue", { desc: "Adjusts the hue (-100 to 100)", example: "effect: hue:40" }],
      ["vibrance", { desc: "Adjusts color vibrance (-100 to 100)", example: "effect: vibrance:50" }],
      ["auto_brightness", { desc: "Automatically adjusts brightness", example: "effect: auto_brightness" }],
      ["auto_contrast", { desc: "Automatically adjusts contrast", example: "effect: auto_contrast" }],
      ["auto_color", { desc: "Automatically adjusts colors", example: "effect: auto_color" }],
      ["sharpen", { desc: "Sharpens the image (1-2000)", example: "effect: sharpen:100" }],
      ["unsharp_mask", { desc: "Applies unsharp mask filter (strength 1-2000)", example: "effect: unsharp_mask:200" }],
      ["oil_paint", { desc: "Applies an oil painting effect (1-100)", example: "effect: oil_paint:50" }],
      ["vignette", { desc: "Applies a vignette effect (0-100)", example: "effect: vignette:50" }],
      ["blackwhite", { desc: "Converts to black and white with threshold (0-100)", example: "effect: blackwhite:50" }],
      ["negate", { desc: "Negates all colors in the image", example: "effect: negate" }],
      ["red", { desc: "Adjusts red channel (-100 to 100)", example: "effect: red:50" }],
      ["green", { desc: "Adjusts green channel (-100 to 100)", example: "effect: green:50" }],
      ["blue", { desc: "Adjusts blue channel (-100 to 100)", example: "effect: blue:50" }],
      ["gamma", { desc: "Adjusts gamma levels (-50 to 150)", example: "effect: gamma:50" }],
      ["tint", { desc: "Applies a tint effect with color blending", example: "effect: tint:100:red" }],
      ["colorize", { desc: "Colorizes the image (0-100)", example: "effect: colorize:50" }],
      ["trim", { desc: "Removes edges that match the background color", example: "effect: trim" }],
      ["shadow", { desc: "Applies a shadow effect", example: "effect: shadow:50" }],
      ["outline", { desc: "Applies an outline effect", example: "effect: outline" }],
      ["gradient_fade", { desc: "Applies a gradient fade", example: "effect: gradient_fade:20" }],
      ["vectorize", { desc: "Converts raster image to vector", example: "effect: vectorize" }],
      ["background_removal", { desc: "Removes the background from the image (AI-powered)", example: "effect: background_removal" }],
      ["generative_fill", { desc: "Uses AI to fill in missing parts of an image", example: "effect: generative_fill" }],
      ["generative_replace", { desc: "Uses AI to replace objects in an image", example: "effect: generative_replace:from_car;to_truck" }],
      ["generative_restore", { desc: "Uses AI to restore and enhance image quality", example: "effect: generative_restore" }],
      ["generative_recolor", { desc: "Uses AI to recolor objects", example: "effect: generative_recolor:prompt_(blue car)" }],
      ["upscale", { desc: "Upscales image using AI", example: "effect: upscale" }],
      ["improve", { desc: "Automatically improves image quality", example: "effect: improve" }],
      ["preview", { desc: "Generates a preview version optimized for speed", example: "effect: preview" }],

      // Format options
      ["jpg", { desc: "JPEG format - lossy compression, good for photos", example: "format: jpg" }],
      ["jpeg", { desc: "JPEG format - lossy compression, good for photos", example: "format: jpeg" }],
      ["png", { desc: "PNG format - lossless with transparency support", example: "format: png" }],
      ["webp", { desc: "WebP format - modern efficient format with transparency", example: "format: webp" }],
      ["avif", { desc: "AVIF format - next-gen image format with excellent compression", example: "format: avif" }],
      ["gif", { desc: "GIF format - for animations and simple graphics", example: "format: gif" }],
      ["bmp", { desc: "BMP format - uncompressed bitmap", example: "format: bmp" }],
      ["tiff", { desc: "TIFF format - high-quality uncompressed", example: "format: tiff" }],
      ["svg", { desc: "SVG format - vector graphics", example: "format: svg" }],
      ["pdf", { desc: "PDF format - document format", example: "format: pdf" }],
      ["mp4", { desc: "MP4 format - video format", example: "format: mp4" }],
      ["webm", { desc: "WebM format - web video format", example: "format: webm" }],
      ["flv", { desc: "FLV format - Flash video", example: "format: flv" }],
      ["mov", { desc: "MOV format - QuickTime video", example: "format: mov" }],
      ["ogv", { desc: "OGV format - Ogg video", example: "format: ogv" }],
      ["m3u8", { desc: "HLS format - adaptive streaming", example: "format: m3u8" }],
      ["mpd", { desc: "MPEG-DASH format - adaptive streaming", example: "format: mpd" }],

      // Video codecs
      ["h264", { desc: "H.264/AVC video codec - widely supported", example: "video_codec: h264" }],
      ["h265", { desc: "H.265/HEVC video codec - better compression", example: "video_codec: h265" }],
      ["vp8", { desc: "VP8 video codec - WebM format", example: "video_codec: vp8" }],
      ["vp9", { desc: "VP9 video codec - improved WebM", example: "video_codec: vp9" }],
      ["theora", { desc: "Theora video codec - Ogg format", example: "video_codec: theora" }],

      // Audio codecs
      ["aac", { desc: "AAC audio codec - high quality", example: "audio_codec: aac" }],
      ["mp3", { desc: "MP3 audio codec - widely supported", example: "audio_codec: mp3" }],
      ["vorbis", { desc: "Vorbis audio codec - Ogg format", example: "audio_codec: vorbis" }],
      ["opus", { desc: "Opus audio codec - modern efficient codec", example: "audio_codec: opus" }],
    ]);
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return undefined;
    }

    let word = document.getText(wordRange);
    const keywords = Array.from(this.documentation.keys());
    word = keywords.find((keyword) => word.startsWith(`${keyword}_`)) || word;

    const doc = this.documentation.get(word);

    if (doc) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**${word}**\n\n`);

      // Show alias information if available
      if (doc.alias) {
        markdown.appendMarkdown(`*Also available as: \`${doc.alias}\`*\n\n`);
      }

      markdown.appendMarkdown(`${doc.desc}\n\n`);

      if (doc.example) {
        markdown.appendCodeblock(doc.example, "cldt");
      }

      markdown.appendMarkdown("\n\n[Cloudinary Transformation Reference](https://cloudinary.com/documentation/transformation_reference)");
      return new vscode.Hover(markdown, wordRange);
    }

    return undefined;
  }
}
