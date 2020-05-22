const {read, write} = require('to-vfile')
const remark = require('remark')
const mdx = require('remark-mdx')

async function getMdxContent(mdxFile) {
  let data;
  if(!mdx) {
    return
  }
  const path = `./content/${mdxFile}`;
  const file = await read(path)
  const contents = await remark()
    .use(mdx)
    .use(() => tree => {
      data = tree
    })
    .process(file)
  await write({
    path,
    contents
  })

  return data
}

module.exports = getMdxContent;