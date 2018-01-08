import * as copier from 'cp-file';

const copy = () => {
  process.chdir('./');
  copier('src/schemas/config.json', 'dist/schemas/config.json').then(() => {
    console.log('Schemas copied');
  }).catch(console.error);
  

  copier('package.json', 'dist/package.json').then(() => {
    console.log('Package.json copied');
  }).catch(console.error);
}

copy();
