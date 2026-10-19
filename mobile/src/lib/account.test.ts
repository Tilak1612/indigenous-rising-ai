import { profileMissingFields, type Profile } from './account';

jest.mock('./api', () => ({ callFunction: jest.fn() }));
jest.mock('./supabase', () => ({ supabase: {} }));

const full: Profile = {
  id: 'u1',
  full_name: 'Test',
  email: 't@example.invalid',
  business_name: 'Co',
  province: 'AB',
  industry: 'Tech',
  business_stage: 'startup',
  indigenous_identity: null,
  entity_type: null,
};

describe('profileMissingFields', () => {
  test('no profile row at all', () => expect(profileMissingFields(null)).toEqual(['business profile']));
  test('complete', () => expect(profileMissingFields(full)).toEqual([]));
  test('lists each missing matcher field', () => {
    expect(profileMissingFields({ ...full, province: null, industry: '' })).toEqual(['province', 'industry']);
  });
});
