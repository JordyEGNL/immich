import { getAltText } from '$lib/utils/thumbnail-util';
import type { AssetResponseDto } from '@immich/sdk';
import { init, register, waitLocale } from 'svelte-i18n';

describe('getAltText', () => {
  beforeAll(async () => {
    register('en', () =>
      Promise.resolve({
        image_taken: 'Image taken',
        image_alt_text_date: 'on {date}',
        image_alt_text_people:
          '{count, plural, =0 {} =1 {with {person1}} =2 {with {person1} and {person2}} =3 {with {person1}, {person2} and {person3}} other {with {person1}, {person2}, and {others, number} others}}',
        image_alt_text_place: 'in {city}, {country}',
      }),
    );

    await init({ fallbackLocale: 'en' });
    await waitLocale('en');
  });

  it('returns the description', () => {
    const asset = {
      exifInfo: { description: 'description' },
    } as AssetResponseDto;
    expect(getAltText(asset)).toEqual('description');
  });

  it('returns the city and country', () => {
    const asset = {
      exifInfo: { city: 'city', country: 'country' },
      localDateTime: '2024-01-01T12:00:00.000Z',
    } as AssetResponseDto;
    expect(getAltText(asset)).toEqual('Image taken in city, country on January 1, 2024');
  });

  // convert the people tests into an it.each
  it.each([
    [[{ name: 'person' }], 'Image taken with person on January 1, 2024'],
    [[{ name: 'person1' }, { name: 'person2' }], 'Image taken with person1 and person2 on January 1, 2024'],
    [
      [{ name: 'person1' }, { name: 'person2' }, { name: 'person3' }],
      'Image taken with person1, person2 and person3 on January 1, 2024',
    ],
    [
      [{ name: 'person1' }, { name: 'person2' }, { name: 'person3' }, { name: 'person4' }],
      'Image taken with person1, person2, and 2 others on January 1, 2024',
    ],
  ])('returns the people, correctly formatted', (people, expected) => {
    const asset = {
      people,
      localDateTime: '2024-01-01T12:00:00.000Z',
    } as AssetResponseDto;
    expect(getAltText(asset)).toEqual(expected);
  });

  it('returns location, people, and date', () => {
    const asset = {
      exifInfo: { city: 'city', country: 'country' },
      people: [{ name: 'person1' }, { name: 'person2' }, { name: 'person3' }],
      localDateTime: '2024-01-01T12:00:00.000Z',
    } as AssetResponseDto;
    expect(getAltText(asset)).toEqual(
      'Image taken in city, country with person1, person2 and person3 on January 1, 2024',
    );
  });
});
