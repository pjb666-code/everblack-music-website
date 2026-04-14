import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AboutSection { 'title' : string, 'content' : string }
export interface ContactInfo {
  'name' : string,
  'email' : string,
  'address' : string,
}
export interface FileReference { 'hash' : string, 'path' : string }
export interface HeaderSection {
  'verticalPadding' : bigint,
  'logoPath' : string,
  'compact' : boolean,
}
export interface HeroSection { 'headline' : string }
export interface TeachingModel {
  'title' : string,
  'features' : Array<string>,
  'description' : string,
  'price' : string,
}
export interface _SERVICE {
  'dropFileReference' : ActorMethod<[string], undefined>,
  'getAboutSection' : ActorMethod<[], AboutSection>,
  'getContactInfo' : ActorMethod<[], ContactInfo>,
  'getFileReference' : ActorMethod<[string], FileReference>,
  'getHeaderSection' : ActorMethod<[], HeaderSection>,
  'getHeroSection' : ActorMethod<[], HeroSection>,
  'getTeachingModels' : ActorMethod<[], Array<TeachingModel>>,
  'listFileReferences' : ActorMethod<[], Array<FileReference>>,
  'registerFileReference' : ActorMethod<[string, string], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
