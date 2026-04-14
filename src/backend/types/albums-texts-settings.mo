// Domain types: albums, site-texts, and favicon setting.
// Extended MediaItem fields are declared here so the mixin can import them.
module {

  // An album that groups multiple media tracks.
  public type Album = {
    id : Text;
    title : Text;
    artist : Text;
    coverPath : ?Text;
    description : ?Text;
    releaseYear : ?Text;
    order : Nat;
  };

  // Extended MediaItem — adds album grouping fields.
  // The main actor type must match this shape when the develop agent wires it in.
  public type MediaItemExtended = {
    id : Nat;
    title : Text;
    description : Text;
    mediaType : Text;
    url : Text;
    thumbnailPath : ?Text;
    waveformPath : ?Text;
    // Album fields (new)
    albumId : ?Text;
    albumTitle : ?Text;
    albumCoverPath : ?Text;
    trackNumber : ?Nat;
    isAlbumTrack : Bool;
  };

  // Editable texts for dedicated pages and footer.
  public type SiteTexts = {
    unterrichtHeadline : ?Text;
    unterrichtIntro : ?Text;
    unterrichtCTA : ?Text;
    studioHeadline : ?Text;
    studioIntro : ?Text;
    studioCTA : ?Text;
    mediaHeadline : ?Text;
    mediaIntro : ?Text;
    mediaCTA : ?Text;
    shopHeadline : ?Text;
    shopIntro : ?Text;
    shopCTA : ?Text;
    footerCopyright : ?Text;
  };
};
