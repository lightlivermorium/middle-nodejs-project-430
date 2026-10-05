import { randomInt } from 'node:crypto';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

const pickCodeChar = () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];

export const generateCode = () => Array.from({ length: CODE_LENGTH }, pickCodeChar).join('');
