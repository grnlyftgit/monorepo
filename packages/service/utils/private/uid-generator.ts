import config from '../../config/env';
import { v4 as uuidv4 } from 'uuid';

export function generateUID(prefix?: string) {
  const pre = prefix ? prefix.toUpperCase() : 'GLMX';
  const randomPart = uuidv4().replace(/-/g, '').toUpperCase();
  return (pre + randomPart).substring(0, 10); // GLMU + 6 chars from UUID
}

export const generateNextUID = (
  latestId?: string | null,
  prefix?: string | 'GLMX'
): string => {
  const idLength = 10;
  const numberLength = idLength - (prefix?.length || 0);

  if (latestId) {
    const numericPart = latestId.slice(prefix?.length || 0);
    const nextNumber = parseInt(numericPart, 10) + 1;
    return `${prefix}${nextNumber.toString().padStart(numberLength, '0')}`;
  } else {
    const startingNumber = parseInt(config.STARTING_NUMBER, 10);
    return `${prefix}${startingNumber.toString().padStart(numberLength, '0')}`;
  }
};
