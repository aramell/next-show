import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from 'jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, { prefix: '<rootDir>/' }),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          ...compilerOptions,
          module: 'commonjs',
        },
      },
    ],
  },
};

export default config;

