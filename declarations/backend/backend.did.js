export const idlFactory = ({ IDL }) => {
  const AboutSection = IDL.Record({ 'title' : IDL.Text, 'content' : IDL.Text });
  const ContactInfo = IDL.Record({
    'name' : IDL.Text,
    'email' : IDL.Text,
    'address' : IDL.Text,
  });
  const FileReference = IDL.Record({ 'hash' : IDL.Text, 'path' : IDL.Text });
  const HeaderSection = IDL.Record({
    'verticalPadding' : IDL.Nat,
    'logoPath' : IDL.Text,
    'compact' : IDL.Bool,
  });
  const HeroSection = IDL.Record({ 'headline' : IDL.Text });
  const TeachingModel = IDL.Record({
    'title' : IDL.Text,
    'features' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'price' : IDL.Text,
  });
  return IDL.Service({
    'dropFileReference' : IDL.Func([IDL.Text], [], []),
    'getAboutSection' : IDL.Func([], [AboutSection], []),
    'getContactInfo' : IDL.Func([], [ContactInfo], []),
    'getFileReference' : IDL.Func([IDL.Text], [FileReference], []),
    'getHeaderSection' : IDL.Func([], [HeaderSection], []),
    'getHeroSection' : IDL.Func([], [HeroSection], []),
    'getTeachingModels' : IDL.Func([], [IDL.Vec(TeachingModel)], []),
    'listFileReferences' : IDL.Func([], [IDL.Vec(FileReference)], []),
    'registerFileReference' : IDL.Func([IDL.Text, IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
