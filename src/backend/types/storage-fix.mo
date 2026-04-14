import Storage "mo:caffeineai-object-storage/Storage";

module {
  /// A media item backed by a real blob reference (audio, video, image, or external URL)
  public type MediaItem = {
    id : Nat;
    title : Text;
    description : Text;
    /// "audio" | "video" | "youtube" | "spotify" | "image"
    mediaType : Text;
    /// Used only for external links (YouTube, Spotify). Null for uploaded blobs.
    externalUrl : ?Text;
    /// Blob reference for uploaded audio / video files. Null for external links.
    blobFile : ?Storage.ExternalBlob;
    /// Cover artwork / thumbnail blob reference.
    coverArt : ?Storage.ExternalBlob;
    /// Original filename for type detection on the frontend.
    fileName : ?Text;
    /// MIME type string (e.g. "audio/mpeg", "video/mp4") for reliable type detection.
    mimeType : ?Text;
  };

  /// A teaching model entry; may carry an optional cover image blob.
  public type TeachingModel = {
    id : Nat;
    title : Text;
    description : Text;
    features : [Text];
    price : Text;
    coverImage : ?Storage.ExternalBlob;
  };

  /// A studio service entry; may carry an optional cover image and media demo blobs.
  public type StudioService = {
    id : Nat;
    title : Text;
    description : Text;
    price : Text;
    coverImage : ?Storage.ExternalBlob;
    /// Audio/video demo samples attached to this service.
    mediaSamples : [MediaSample];
  };

  /// A single media sample attached to a studio service.
  public type MediaSample = {
    id : Nat;
    title : Text;
    blobFile : Storage.ExternalBlob;
    fileName : Text;
    mimeType : Text;
  };

  /// A shop product; may carry an optional product image blob.
  public type Product = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    coverImage : ?Storage.ExternalBlob;
    category : Text;
    inventory : Nat;
    isDigital : Bool;
  };
};
