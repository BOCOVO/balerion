import { balerionID } from '../yup';

describe('validators', () => {
  describe('balerionID', () => {
    test.each([
      [0, true],
      ['0', true],
      [1, true],
      ['1', true],
      [undefined, true], // because it's not required
      [{}, false],
      [[], false],
      [null, false],
    ])('balerionID(): %s => %s', async (value, expectedResult) => {
      let result = true;
      try {
        await balerionID().validate(value);
      } catch (e) {
        result = false;
      }

      expect(result).toBe(expectedResult);
    });

    test.each([
      [0, true],
      ['0', true],
      [1, true],
      ['1', true],
      [undefined, false],
      [{}, false],
      [[], false],
      [null, false],
    ])('balerionID().required(): %s => %s', async (value, expectedResult) => {
      let result = true;
      try {
        await balerionID().required().validate(value);
      } catch (e) {
        result = false;
      }

      expect(result).toBe(expectedResult);
    });

    test.each([
      [0, true],
      ['0', true],
      [1, true],
      ['1', true],
      [undefined, true],
      [{}, false],
      [[], false],
      [null, true],
    ])('balerionID().nullable(): %s => %s', async (value, expectedResult) => {
      let result = true;
      try {
        await balerionID().nullable().validate(value);
      } catch (e) {
        result = false;
      }

      expect(result).toBe(expectedResult);
    });

    test.each([
      [0, true],
      ['0', true],
      [1, true],
      ['1', true],
      [undefined, false],
      [{}, false],
      [[], false],
      [null, true],
    ])('balerionID().nullable().defined(): %s => %s', async (value, expectedResult) => {
      let result = true;
      try {
        await balerionID().nullable().defined().validate(value);
      } catch (e) {
        result = false;
      }

      expect(result).toBe(expectedResult);
    });
  });
});
