#!/usr/bin/env node
import { Project, ClassDeclaration, PropertyDeclaration, SourceFile, Node, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const project = new Project({
  tsConfigFilePath: path.join(__dirname, '../../../apps/backend/tsconfig.json'),
});

const backendSrcPath = path.join(__dirname, '../../../apps/backend/src');
const outputPath = path.join(__dirname, '../src/types/generated');

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

function extractInterfaceName(className: string): string {
  return className;
}

function getTypeFromProperty(prop: PropertyDeclaration): string {
  const typeNode = prop.getTypeNode();
  if (typeNode) {
    const nodeText = typeNode.getText();
    if (nodeText === 'OrderDirectionConstants') {
      return "'ASC' | 'DESC'";
    }
    return nodeText;
  }

  const type = prop.getType();
  const typeText = type.getText();

  if (typeText.includes('import(')) {
    if (typeText.includes('Gender')) return 'Gender';
    if (typeText.includes('Role')) return 'Role';
    if (typeText.includes('Json')) return 'any';
  }

  if (typeText === 'OrderDirectionConstants' || typeText.includes('OrderDirectionConstants')) {
    return "'ASC' | 'DESC'";
  }

  return typeText;
}

function processDto(classDecl: ClassDeclaration): string {
  const className = classDecl.getName();
  if (!className) return '';

  const interfaceName = extractInterfaceName(className);
  const properties: string[] = [];

  classDecl.getProperties().forEach(prop => {
    const propName = prop.getName();
    const isOptional = prop.hasQuestionToken();
    const propType = getTypeFromProperty(prop);

    const jsDocs = prop.getJsDocs();
    if (jsDocs.length > 0) {
      jsDocs.forEach(doc => {
        properties.push(doc.getText());
      });
    }

    properties.push(`  ${propName}${isOptional ? '?' : ''}: ${propType};`);
  });

  return `export interface ${interfaceName} {
${properties.join('\n')}
}`;
}

function generateTypesFromModule(moduleName: string, dtoFiles: SourceFile[]): string {
  const interfaces: string[] = [];
  const imports = new Set<string>();

  dtoFiles.forEach(file => {
    file.getClasses().forEach(classDecl => {
      const className = classDecl.getName();
      if (className && className.endsWith('Dto')) {
        const interfaceCode = processDto(classDecl);
        if (interfaceCode) {
          interfaces.push(interfaceCode);
        }

        classDecl.getProperties().forEach(prop => {
          const propType = getTypeFromProperty(prop);
          if (propType === 'Gender' || propType === 'Role') {
            imports.add(propType);
          }
        });
      }
    });
  });

  let output = '';

  if (imports.size > 0) {
    output += `import { ${Array.from(imports).join(', ')} } from '../enums';\n\n`;
  }

  output += interfaces.join('\n\n');

  return output;
}

const modules = [
  { name: 'auth', path: 'auth/dto' },
  { name: 'activity', path: 'activity/dto' },
  { name: 'user', path: 'users/dto' },
];

const indexExports: string[] = [];

modules.forEach(module => {
  const modulePath = path.join(backendSrcPath, module.path);

  if (!fs.existsSync(modulePath)) {
    console.warn(`Module path not found: ${modulePath}`);
    return;
  }

  const dtoFiles = project.getSourceFiles(`${modulePath}/*.dto.ts`);

  if (dtoFiles.length === 0) {
    console.warn(`No DTO files found in: ${modulePath}`);
    return;
  }

  const generatedTypes = generateTypesFromModule(module.name, dtoFiles);

  if (generatedTypes) {
    const outputFile = path.join(outputPath, `${module.name}.types.ts`);
    fs.writeFileSync(outputFile, generatedTypes);
    console.log(`Generated types for ${module.name} module`);
    indexExports.push(`export * from './${module.name}.types';`);
  }
});

const indexPath = path.join(outputPath, 'index.ts');
fs.writeFileSync(indexPath, indexExports.join('\n') + '\n');
console.log('Generated index file');

console.log('Type generation complete!');