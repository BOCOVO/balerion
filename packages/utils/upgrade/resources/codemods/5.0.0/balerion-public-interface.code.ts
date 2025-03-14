import { Transform, JSCodeshift, Collection } from 'jscodeshift';

/*
This codemod transforms @balerion/balerion imports to use the new public interface.

ESM
Before:

import balerion from '@balerion/balerion';
balerion();

After:

import { createBalerion } from '@balerion/balerion'; // keeps the default import
createBalerion();

---

Common JS
Before:

const balerion = require('@balerion/balerion');
balerion();

After:

const balerion = require('@balerion/balerion');
balerion.createBalerion();

*/

const transformBalerionImport = (root: Collection, j: JSCodeshift) => {
  root.find(j.ImportDefaultSpecifier).forEach((path) => {
    if (path.parent.value.source.value === '@balerion/balerion') {
      const newSpecifiers = path.parent.value.specifiers.filter(
        (specifier) => specifier.type !== 'ImportDefaultSpecifier'
      );

      j(path.parent).replaceWith(
        j.importDeclaration(
          [...newSpecifiers, j.importSpecifier(j.identifier('createBalerion'))],
          j.literal('@balerion/balerion')
        )
      );

      transformFunctionCalls(path.value.local.name, root, j);
    }
  });
};

const transformRequireImport = (root: Collection, j: JSCodeshift) => {
  root
    .find(j.VariableDeclarator, {
      init: {
        callee: {
          name: 'require',
        },
        arguments: [{ value: '@balerion/balerion' }],
      },
    })
    .forEach((path) => {
      if (path.value.id.type === 'Identifier') {
        const identifier = path.value.id.name;

        root
          .find(j.CallExpression, {
            callee: {
              type: 'Identifier',
              name: identifier,
            },
          })
          .forEach((callExpressionPath) => {
            j(callExpressionPath).replaceWith(
              j.callExpression(
                j.memberExpression(j.identifier(identifier), j.identifier('createBalerion')),
                callExpressionPath.value.arguments
              )
            );
          });
      }
    });
};

const transformFunctionCalls = (identifier: string, root: Collection, j: JSCodeshift) => {
  root
    .find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: identifier,
      },
    })
    .forEach((path) => {
      // we a type guard again to avoid ts issues
      if (path.value.callee.type === 'Identifier') {
        path.value.callee.name = 'createBalerion';
      }
    });
};

/**
 * Transformations
 *
 * With ESM imports
 *
 * import balerion from '@balerion/balerion'; => import balerion, { createBalerion } from '@balerion/balerion';
 * balerion() => createBalerion()
 *
 * With CJS imports
 *
 * const balerion = require('@balerion/balerion'); => no transform
 * balerion() => balerion.createBalerion()
 */
const transform: Transform = (file, api) => {
  const j = api.jscodeshift;

  const root = j(file.source);

  transformBalerionImport(root, j);
  transformRequireImport(root, j);

  return root.toSource();
};

export const parser = 'tsx';

export default transform;
