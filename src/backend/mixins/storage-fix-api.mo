import Types "../types/storage-fix";
import AccessControl "../authorization/access-control";
import Runtime "mo:core/Runtime";

/// Public API mixin for the storage-fix domain.
/// Replaces old Text-based URL fields with Storage.ExternalBlob for all media,
/// teaching model images, studio service images/demos, and product images.
mixin (
  mediaItems : { var data : [(Nat, Types.MediaItem)] },
  teachingModels : { var data : [(Nat, Types.TeachingModel)] },
  studioServices : { var data : [(Nat, Types.StudioService)] },
  products : { var data : [(Nat, Types.Product)] },
  accessControlState : AccessControl.State
) {

  // ── Media Items ────────────────────────────────────────────────────────────

  public query func getMediaItems() : async [Types.MediaItem] {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func addMediaItem(item : Types.MediaItem) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateMediaItem(item : Types.MediaItem) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func deleteMediaItem(id : Nat) : async () {
    Runtime.trap("not implemented");
  };

  // ── Teaching Models ────────────────────────────────────────────────────────

  public query func getTeachingModels() : async [Types.TeachingModel] {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func addTeachingModel(model : Types.TeachingModel) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateTeachingModel(model : Types.TeachingModel) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func deleteTeachingModel(id : Nat) : async () {
    Runtime.trap("not implemented");
  };

  // ── Studio Services ────────────────────────────────────────────────────────

  public query func getStudioServices() : async [Types.StudioService] {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func addStudioService(service : Types.StudioService) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateStudioService(service : Types.StudioService) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func deleteStudioService(id : Nat) : async () {
    Runtime.trap("not implemented");
  };

  // ── Products ───────────────────────────────────────────────────────────────

  public query func getProducts() : async [Types.Product] {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func addProduct(product : Types.Product) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateProduct(product : Types.Product) : async () {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    Runtime.trap("not implemented");
  };
};
