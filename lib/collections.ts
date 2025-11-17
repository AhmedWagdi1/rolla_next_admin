export const COLLECTIONS = [
  'categories',
  'cities',
  'countries',
  'ff_user_push_notifications',
  'finishing_types',
  'governorates',
  'home_ads',
  'notifications',
  'projects',
  'property_types',
  'proposals',
  'requests',
  'rolla_story',
  'stories',
  'types',
  'users',
] as const;

export type CollectionName = typeof COLLECTIONS[number];

export interface CollectionConfig {
  name: string;
  displayName: string;
  icon: string;
  description: string;
}

export const COLLECTION_CONFIGS: Record<string, CollectionConfig> = {
  users: {
    name: 'users',
    displayName: 'Users',
    icon: 'PersonOutline',
    description: 'User profiles and authentication data'
  },
  categories: {
    name: 'categories',
    displayName: 'Categories',
    icon: 'Category',
    description: 'Property categories (e.g., Chalet, Villa)'
  },
  cities: {
    name: 'cities',
    displayName: 'Cities',
    icon: 'LocationCity',
    description: 'City listings with governorate references'
  },
  countries: {
    name: 'countries',
    displayName: 'Countries',
    icon: 'Public',
    description: 'Country listings'
  },
  ff_user_push_notifications: {
    name: 'ff_user_push_notifications',
    displayName: 'Push Notifications',
    icon: 'Notifications',
    description: 'Firebase push notifications to users'
  },
  finishing_types: {
    name: 'finishing_types',
    displayName: 'Finishing Types',
    icon: 'HomeWork',
    description: 'Types of property finishing (e.g., Full, Semi)'
  },
  governorates: {
    name: 'governorates',
    displayName: 'Governorates',
    icon: 'Map',
    description: 'Regional governorate listings'
  },
  home_ads: {
    name: 'home_ads',
    displayName: 'Home Ads',
    icon: 'Campaign',
    description: 'Advertisement banners for homepage'
  },
  notifications: {
    name: 'notifications',
    displayName: 'Notifications',
    icon: 'NotificationsActive',
    description: 'User notifications for requests and proposals'
  },
  projects: {
    name: 'projects',
    displayName: 'Projects',
    icon: 'Business',
    description: 'Construction and property projects'
  },
  property_types: {
    name: 'property_types',
    displayName: 'Property Types',
    icon: 'Home',
    description: 'Types of properties (e.g., Residential, Commercial)'
  },
  proposals: {
    name: 'proposals',
    displayName: 'Proposals',
    icon: 'Description',
    description: 'Supplier proposals for client requests'
  },
  requests: {
    name: 'requests',
    displayName: 'Requests',
    icon: 'RequestPage',
    description: 'Client requests for construction services'
  },
  rolla_story: {
    name: 'rolla_story',
    displayName: 'Rolla Story',
    icon: 'AutoStories',
    description: 'Company story and about information'
  },
  stories: {
    name: 'stories',
    displayName: 'Stories',
    icon: 'Photo',
    description: 'User-generated stories and content'
  },
  types: {
    name: 'types',
    displayName: 'Types',
    icon: 'Label',
    description: 'General type classifications'
  },
};
