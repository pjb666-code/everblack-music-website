import Types "../types/albums-texts-settings";
import Lib "../lib/albums-texts-settings";
import Map "mo:core/Map";
import AccessControl "../authorization/access-control";
import Runtime "mo:core/Runtime";

// Public API mixin for albums, site texts, and favicon.
// Receives stable state slices from main.mo via mixin parameters.
mixin (
  albums : Map.Map<Text, Types.Album>,
  siteTexts : var Types.SiteTexts,
  faviconUrl : var Text,
  accessControlState : AccessControl.AccessControlState,
) {

  // ---------- Albums (public read, admin write) ----------

  public query func getAlbums() : async [Types.Album] {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func addAlbum(album : Types.Album) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateAlbum(album : Types.Album) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func deleteAlbum(id : Text) : async () {
    Runtime.trap("not implemented");
  };

  // ---------- Site Texts (public read, admin write) ----------

  public query func getSiteTexts() : async Types.SiteTexts {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateSiteTexts(updated : Types.SiteTexts) : async () {
    Runtime.trap("not implemented");
  };

  // ---------- Favicon (public read, admin write) ----------

  public query func getFaviconUrl() : async Text {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateFaviconUrl(url : Text) : async () {
    Runtime.trap("not implemented");
  };
};
