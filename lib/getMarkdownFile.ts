import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { getGithubPreviewProps, parseMarkdown } from "next-tinacms-github";

export const readMarkdownFile = async (filePath: string) => {
  const fileContents = fs.readFileSync(path.resolve(`${filePath}`));
  const { data, content } = matter(fileContents);

  return {
    fileRelativePath: filePath,
    data: {
      frontmatter: data,
      markdownBody: content,
    },
  };
};

export const getMarkdownPreviewProps = async (
  fileRelativePath: string,
  preview: boolean,
  previewData: any
) => {
  if (preview) {
    return await getGithubPreviewProps({
      ...previewData,
      fileRelativePath: fileRelativePath,
      parse: parseMarkdown,
    });
  }

  const file = await readMarkdownFile(fileRelativePath);
  return {
    props: {
      sourceProvider: null,
      error: null,
      preview: false,
      file,
    },
  };
};
