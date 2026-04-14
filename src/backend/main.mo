import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Prim "mo:prim";
import Registry "blob-storage/registry";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import BlobStorage "blob-storage/Mixin";



actor EverblackMusic {
  public type TeachingModel = {
    id : Nat;
    title : Text;
    subtitle : Text;
    description : Text;
    features : [Text];
    price : Text;
    imagePath : ?Text;
    featured : Bool;
    order : Nat;
  };

  public type ContactInfo = {
    name : Text;
    email : Text;
    address : Text;
    phone : ?Text;
  };

  public type AboutSection = {
    title : Text;
    content : Text;
  };

  public type HeroSection = {
    headline : Text;
    subheadline : Text;
    ctaPrimary : Text;
    ctaSecondary : Text;
    backgroundImageUrl : ?Text;
  };

  public type HeaderSection = {
    logoPath : Text;
    compact : Bool;
    verticalPadding : Nat;
    logoSizePercent : Nat;
  };

  public type StudioService = {
    id : Nat;
    title : Text;
    description : Text;
    price : Text;
    imagePath : ?Text;
    mediaSamples : [Text];
    order : Nat;
  };

  public type Album = {
    id : Text;
    title : Text;
    artist : Text;
    coverPath : ?Text;
    description : ?Text;
    releaseYear : ?Text;
    order : Nat;
  };

  public type MediaItem = {
    id : Nat;
    title : Text;
    description : Text;
    mediaType : Text;
    url : Text;
    thumbnailPath : ?Text;
    waveformPath : ?Text;
    albumId : ?Text;
    albumTitle : ?Text;
    albumCoverPath : ?Text;
    trackNumber : ?Nat;
    isAlbumTrack : Bool;
  };

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

  public type ColorScheme = {
    primaryColor : Text;
    secondaryColor : Text;
    backgroundColor : Text;
    textColor : Text;
    gradientEnabled : Bool;
    gradientStartColor : Text;
    gradientEndColor : Text;
  };

  public type AdminCredentials = {
    username : Text;
    passwordHash : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type Product = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Text;
    inventory : Nat;
    isDigital : Bool;
  };

  public type LandingPageConfig = {
    showFeaturedContent : Bool;
    featuredContentType : Text;
    featuredContentId : ?Nat;
  };

  public type LegalDocument = {
    content : Text;
    lastUpdated : Nat64;
  };

  public type FeatureCard = {
    id : Nat;
    icon : Text;
    color : Text;
    title : Text;
    subtitle : Text;
    order : Nat;
  };

  public type AnimationConfig = {
    scrollAnimationsEnabled : Bool;
    animationDuration : Nat;
  };

  public type StudioStat = {
    id : Text;
    icon : Text;
    statLabel : Text;
    order : Nat;
  };

  let registry = Registry.new();
  let accessControlState = AccessControl.initState();

  let teachingModels = Map.empty<Nat, TeachingModel>();
  let studioServices = Map.empty<Nat, StudioService>();
  let mediaItems = Map.empty<Nat, MediaItem>();
  let albums = Map.empty<Text, Album>();

  var colorScheme : ColorScheme = {
    primaryColor = "#0D9488";
    secondaryColor = "#134e4a";
    backgroundColor = "#09090b";
    textColor = "#fafafa";
    gradientEnabled = false;
    gradientStartColor = "#0D9488";
    gradientEndColor = "#06b6d4";
  };

  var adminCredentials : AdminCredentials = {
    username = "admin";
    passwordHash = "hashed_password";
  };
  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Nat, Product>();

  var landingPageConfig : LandingPageConfig = {
    showFeaturedContent = false;
    featuredContentType = "none";
    featuredContentId = null;
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let sessionOwners = Map.empty<Text, Principal>();

  var heroSection : HeroSection = {
    headline = "Gitarrenunterricht in Aachen";
    subheadline = "Professioneller Gitarrenunterricht für alle Levels — von Anfänger bis Fortgeschrittene. Entdecke deinen eigenen Sound mit Everblack Music.";
    ctaPrimary = "Unterrichtsmodelle";
    ctaSecondary = "Kontakt";
    backgroundImageUrl = null;
  };

  var aboutSection : AboutSection = {
    title = "Über Everblack Music";
    content = "Ich bin Gitarrist und Musiklehrer aus Aachen mit über 10 Jahren Erfahrung. Mein Unterricht ist individuell auf dich zugeschnitten — egal ob du gerade erst anfängst oder dein Spiel auf das nächste Level bringen möchtest. Neben dem Unterricht biete ich professionelle Studioservices an.";
  };

  var contactInfo : ContactInfo = {
    name = "Everblack Music";
    email = "info@everblackmusic.com";
    address = "Bergische Gasse 9, 52064 Aachen";
    phone = null;
  };

  // Legal documents
  var imprintText : LegalDocument = {
    content = "# Impressum\n\nEverblack Music\nBergische Gasse 9\n52064 Aachen\n\nE-Mail: info@everblackmusic.com\n\n*Bitte im Admin-Panel aktualisieren.*";
    lastUpdated = Prim.time();
  };
  var privacyPolicyText : LegalDocument = {
    content = "# Datenschutzerklärung\n\n*Bitte im Admin-Panel ausfüllen.*";
    lastUpdated = Prim.time();
  };
  var termsOfServiceText : LegalDocument = {
    content = "# Nutzungsbedingungen\n\n*Bitte im Admin-Panel ausfüllen.*";
    lastUpdated = Prim.time();
  };

  let featureCards = Map.empty<Nat, FeatureCard>();
  let studioStats = Map.empty<Text, StudioStat>();

  var animationConfig : AnimationConfig = {
    scrollAnimationsEnabled = true;
    animationDuration = 300;
  };

  // ID counters — start after seed data IDs
  var nextTeachingModelId : Nat = 3;
  var nextStudioServiceId : Nat = 4;
  var nextFeatureCardId : Nat = 5;
  var nextMediaItemId : Nat = 1;
  var nextProductId : Nat = 1;

  // Site logo/favicon URL — stored in blob storage, managed via admin
  var siteLogoUrl : Text = "";

  // Favicon URL — separate from the header logo
  var faviconUrl : Text = "";

  // Logo size in the header as a percentage (100 = 100% of default size)
  var logoSizePercent : Nat = 100;

  // Site-wide editable texts
  var siteTexts : SiteTexts = {
    unterrichtHeadline = null;
    unterrichtIntro = null;
    unterrichtCTA = null;
    studioHeadline = null;
    studioIntro = null;
    studioCTA = null;
    mediaHeadline = null;
    mediaIntro = null;
    mediaCTA = null;
    shopHeadline = null;
    shopIntro = null;
    shopCTA = null;
    footerCopyright = null;
  };

  // Admin setup code — used to regain admin access after rebuilds
  var adminSetupCode : Text = "xK9mP2vQ8nR5tL1wJ7hF3";

  // Seed version — increment to force re-seed with new data on next upgrade.
  // Version history: 0 = unseeded, 1 = old (wrong) data, 2 = correct lesson models
  var seedVersion : Nat = 0;

  // Seed all default content — runs when seedVersion < 2
  func seedData() {
    if (seedVersion >= 2) return;
    seedVersion := 2;

    // Clear maps before re-seeding in case partial old data exists
    teachingModels.clear();
    studioServices.clear();
    featureCards.clear();

    // Teaching model 1 — Privatunterricht
    teachingModels.add(1, {
      id = 1;
      title = "Privatunterricht";
      subtitle = "Aachen & online";
      description = "Wöchentliche 1:1-Sessions für maximalen Fortschritt";
      price = "150 € / Monat";
      features = [
        "Wöchentliche 1:1-Sessions (45min)",
        "Persönliche Betreuung & exklusives Unterrichtsmaterial",
        "Ideal für motivierte Schüler, die konstante Begleitung wollen",
        "Begrenzte Verfügbarkeit",
        "10er-Karten Option",
      ];
      imagePath = null;
      featured = true;
      order = 1;
    });

    // Teaching model 2 — Coaching
    teachingModels.add(2, {
      id = 2;
      title = "Coaching";
      subtitle = "online";
      description = "Strukturiertes Lernen mit persönlichem Feedback";
      price = "50 € / Monat";
      features = [
        "Individuelles Material & Übungsplan",
        "2x monatliches Feedback",
        "Kombinierbar mit 10er-Karten",
        "Ideal für Schüler, die strukturiert, aber flexibel lernen wollen",
      ];
      imagePath = null;
      featured = false;
      order = 2;
    });

    // Studio services — ONLY Recording, Mixing, Mastering
    studioServices.add(1, {
      id = 1;
      title = "Recording";
      description = "Professionelle Aufnahmen in moderner Studioumgebung";
      price = "Auf Anfrage";
      imagePath = null;
      mediaSamples = [];
      order = 1;
    });
    studioServices.add(2, {
      id = 2;
      title = "Mixing";
      description = "Ausgewogener, klarer Mix für deine Produktionen";
      price = "Auf Anfrage";
      imagePath = null;
      mediaSamples = [];
      order = 2;
    });
    studioServices.add(3, {
      id = 3;
      title = "Mastering";
      description = "Finales Mastering für Streaming und CD-Release";
      price = "Auf Anfrage";
      imagePath = null;
      mediaSamples = [];
      order = 3;
    });

    // Feature cards
    featureCards.add(1, {
      id = 1;
      icon = "guitar";
      color = "#0D9488";
      title = "10+ Jahre Erfahrung";
      subtitle = "Professioneller Unterricht";
      order = 1;
    });
    featureCards.add(2, {
      id = 2;
      icon = "target";
      color = "#0D9488";
      title = "Individuell & Flexibel";
      subtitle = "Angepasst an dich";
      order = 2;
    });
    featureCards.add(3, {
      id = 3;
      icon = "music";
      color = "#0D9488";
      title = "Alle Levels willkommen";
      subtitle = "Anfänger bis Profi";
      order = 3;
    });
    featureCards.add(4, {
      id = 4;
      icon = "map-pin";
      color = "#0D9488";
      title = "Aachen & Umgebung";
      subtitle = "Persönlicher Unterricht";
      order = 4;
    });

    // Studio stats — seeded only if empty
    studioStats.add("stat-1", { id = "stat-1"; icon = "Calendar";     statLabel = "10+ Jahre Erfahrung";    order = 0 });
    studioStats.add("stat-2", { id = "stat-2"; icon = "CheckCircle2"; statLabel = "200+ Projekte";           order = 1 });
    studioStats.add("stat-3", { id = "stat-3"; icon = "Headphones";   statLabel = "Pro Equipment";           order = 2 });
    studioStats.add("stat-4", { id = "stat-4"; icon = "Zap";          statLabel = "Flexibel Terminbuchung"; order = 3 });
  };

  // Run seed — also re-seeds when seedVersion is outdated after upgrade
  seedData();

  include BlobStorage(registry);

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Allows the caller to become admin by providing the correct setup code.
  // Replaces any existing admin assignment — useful after rebuilds when
  // the Internet Identity Principal has changed.
  public shared ({ caller }) func resetAdminForNewPrincipal(setupCode : Text) : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    if (setupCode != adminSetupCode) {
      return false;
    };
    // Reset all existing roles, then grant admin to this caller
    accessControlState.userRoles.clear();
    accessControlState.adminAssigned := false;
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  // Admin-only: update the setup code used by resetAdminForNewPrincipal
  public shared ({ caller }) func updateAdminSetupCode(newCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update the setup code");
    };
    adminSetupCode := newCode;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public read functions
  public query func getTeachingModels() : async [TeachingModel] {
    teachingModels.values().toArray();
  };

  public query func getContactInfo() : async ContactInfo {
    contactInfo;
  };

  public query func getAboutSection() : async AboutSection {
    aboutSection;
  };

  public query func getHeroSection() : async HeroSection {
    heroSection;
  };

  public query func getHeaderSection() : async HeaderSection {
    {
      logoPath = "Transparent Background-white.png";
      compact = true;
      verticalPadding = 4;
      logoSizePercent;
    };
  };

  public query func getStudioServices() : async [StudioService] {
    studioServices.values().toArray();
  };

  public query func getMediaItems() : async [MediaItem] {
    mediaItems.values().toArray();
  };

  public query func getColorScheme() : async ColorScheme {
    colorScheme;
  };

  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getLandingPageConfig() : async LandingPageConfig {
    landingPageConfig;
  };

  public query func getFeatureCards() : async [FeatureCard] {
    featureCards.values().toArray();
  };

  public query func getAnimationConfig() : async AnimationConfig {
    animationConfig;
  };

  // Site logo / favicon URL
  public query func getSiteLogoUrl() : async Text {
    siteLogoUrl;
  };

  public shared ({ caller }) func updateSiteLogoUrl(url : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update the site logo");
    };
    siteLogoUrl := url;
  };

  // Logo size percent — readable by anyone, writable by admin only
  public query func getLogoSizePercent() : async Nat {
    logoSizePercent;
  };

  public shared ({ caller }) func updateLogoSizePercent(size : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update the logo size");
    };
    logoSizePercent := size;
  };

  // Admin-only write functions — color scheme
  public shared ({ caller }) func updateColorScheme(newScheme : ColorScheme) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update color scheme");
    };
    colorScheme := newScheme;
  };

  // Hero / About / Contact CRUD
  public shared ({ caller }) func updateHeroSection(section : HeroSection) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update hero section");
    };
    heroSection := section;
  };

  public shared ({ caller }) func updateAboutSection(section : AboutSection) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update about section");
    };
    aboutSection := section;
  };

  public shared ({ caller }) func updateContactInfo(info : ContactInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update contact info");
    };
    contactInfo := info;
  };

  // Teaching model CRUD
  public shared ({ caller }) func addTeachingModel(model : TeachingModel) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add teaching models");
    };
    let id = nextTeachingModelId;
    nextTeachingModelId += 1;
    teachingModels.add(id, { model with id });
    id;
  };

  public shared ({ caller }) func updateTeachingModel(model : TeachingModel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update teaching models");
    };
    teachingModels.add(model.id, model);
  };

  public shared ({ caller }) func deleteTeachingModel(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete teaching models");
    };
    teachingModels.remove(id);
  };

  // Studio service CRUD
  public shared ({ caller }) func addStudioService(service : StudioService) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add studio services");
    };
    let id = nextStudioServiceId;
    nextStudioServiceId += 1;
    studioServices.add(id, { service with id });
    id;
  };

  public shared ({ caller }) func updateStudioService(service : StudioService) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update studio services");
    };
    studioServices.add(service.id, service);
  };

  public shared ({ caller }) func deleteStudioService(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete studio services");
    };
    studioServices.remove(id);
  };

  // Media item CRUD
  public shared ({ caller }) func addMediaItem(item : MediaItem) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add media items");
    };
    let id = nextMediaItemId;
    nextMediaItemId += 1;
    mediaItems.add(id, { item with id });
    id;
  };

  public shared ({ caller }) func updateMediaItem(item : MediaItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update media items");
    };
    mediaItems.add(item.id, item);
  };

  public shared ({ caller }) func deleteMediaItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete media items");
    };
    mediaItems.remove(id);
  };

  public shared ({ caller }) func updateAdminCredentials(newCredentials : AdminCredentials) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update credentials");
    };
    adminCredentials := newCredentials;
  };

  // Product CRUD
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = nextProductId;
    nextProductId += 1;
    products.add(id, { product with id });
    id;
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  public shared ({ caller }) func updateLandingPageConfig(config : LandingPageConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update landing page config");
    };
    landingPageConfig := config;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  // File reference functions
  public shared ({ caller }) func registerFileReference(path : Text, hash : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can register file references");
    };
    Registry.add(registry, path, hash);
  };

  public query func getFileReference(path : Text) : async Registry.FileReference {
    Registry.get(registry, path);
  };

  public query ({ caller }) func listFileReferences() : async [Registry.FileReference] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list file references");
    };
    Registry.list(registry);
  };

  public shared ({ caller }) func dropFileReference(path : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can drop file references");
    };
    Registry.remove(registry, path);
  };

  // Stripe integration
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    switch (stripeConfig) {
      case null {
        Runtime.trap("Stripe configuration not set");
      };
      case (?config) {
        let sessionId = await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
        sessionOwners.add(sessionId, caller);
        sessionId;
      };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (sessionOwners.get(sessionId)) {
      case null {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Session not found or access denied");
        };
      };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own checkout sessions");
        };
      };
    };

    switch (stripeConfig) {
      case null {
        #failed { error = "Stripe configuration not set" };
      };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  // Legal document functions
  public shared ({ caller }) func updateImprint(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update imprint");
    };
    imprintText := {
      content;
      lastUpdated = Prim.time();
    };
  };

  public shared ({ caller }) func updatePrivacyPolicy(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update privacy policy");
    };
    privacyPolicyText := {
      content;
      lastUpdated = Prim.time();
    };
  };

  public shared ({ caller }) func updateTermsOfService(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update terms of service");
    };
    termsOfServiceText := {
      content;
      lastUpdated = Prim.time();
    };
  };

  public query func getImprint() : async LegalDocument {
    imprintText;
  };

  public query func getPrivacyPolicy() : async LegalDocument {
    privacyPolicyText;
  };

  public query func getTermsOfService() : async LegalDocument {
    termsOfServiceText;
  };

  // Feature card CRUD
  public shared ({ caller }) func addFeatureCard(card : FeatureCard) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add feature cards");
    };
    let id = nextFeatureCardId;
    nextFeatureCardId += 1;
    featureCards.add(id, { card with id });
    id;
  };

  public shared ({ caller }) func updateFeatureCard(card : FeatureCard) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update feature cards");
    };
    featureCards.add(card.id, card);
  };

  public shared ({ caller }) func deleteFeatureCard(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete feature cards");
    };
    featureCards.remove(id);
  };

  public shared ({ caller }) func updateAnimationConfig(config : AnimationConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update animation config");
    };
    animationConfig := config;
  };

  // Studio stat CRUD
  public query func getStudioStats() : async [StudioStat] {
    studioStats.values().toArray();
  };

  public shared ({ caller }) func addStudioStat(stat : StudioStat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add studio stats");
    };
    studioStats.add(stat.id, stat);
  };

  public shared ({ caller }) func updateStudioStat(stat : StudioStat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update studio stats");
    };
    studioStats.add(stat.id, stat);
  };

  public shared ({ caller }) func deleteStudioStat(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete studio stats");
    };
    studioStats.remove(id);
  };

  // Album CRUD
  public query func getAlbums() : async [Album] {
    albums.values().toArray();
  };

  public shared ({ caller }) func addAlbum(album : Album) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add albums");
    };
    albums.add(album.id, album);
  };

  public shared ({ caller }) func updateAlbum(album : Album) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update albums");
    };
    albums.add(album.id, album);
  };

  public shared ({ caller }) func deleteAlbum(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete albums");
    };
    albums.remove(id);
  };

  // Site texts CRUD
  public query func getSiteTexts() : async SiteTexts {
    siteTexts;
  };

  public shared ({ caller }) func updateSiteTexts(updated : SiteTexts) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site texts");
    };
    siteTexts := updated;
  };

  // Favicon URL — separate from the header logo
  public query func getFaviconUrl() : async Text {
    faviconUrl;
  };

  public shared ({ caller }) func updateFaviconUrl(url : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update the favicon");
    };
    faviconUrl := url;
  };
};
