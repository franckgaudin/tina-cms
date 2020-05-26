import React from "react";
import ErrorPage from "next/error";
import ReactMarkdown from "react-markdown";
import {
  useGithubMarkdownForm,
  useGithubToolbarPlugins,
} from "react-tinacms-github";

const fg = require("fast-glob");

import { fileToUrl } from "../../lib/urls";
import { getMarkdownPreviewProps } from "../../lib/getMarkdownFile";

export default function Docs({ file, preview }) {
  if (!file) {
    return <ErrorPage statusCode={404} />;
  }

  const formOptions = {
    label: "Blog Post",
    fields: [
      {
        label: "Title",
        name: "frontmatter.title",
        component: "text",
      },
      {
        label: "Date Posted",
        name: "frontmatter.date",
        component: "date",
        dateFormat: "MMMM DD YYYY",
        timeFormat: false,
      },
      {
        label: "Blog Body",
        name: "markdownBody",
        component: "markdown",
      },
    ],
  };

  // Registers Tina Form
  const [data, form] = useGithubMarkdownForm(file, formOptions);
  useGithubToolbarPlugins();

  const frontmatter = data.frontmatter;
  const markdownBody = data.markdownBody;
  const { title, date } = frontmatter;

  return (
    <>
      <article>
        <section>
          <h1>{title}</h1>
          <p>{date}</p>
        </section>
        <ReactMarkdown source={markdownBody} escapeHtml={false} />
      </article>
    </>
  );
}

export const getStaticProps = async function ({
  preview,
  previewData,
  ...ctx
}) {
  const { slug } = ctx.params;

  const previewProps = await getMarkdownPreviewProps(
    `content/docs/${slug}.md`,
    preview,
    previewData
  );

  if ((previewProps.props.error?.status || "") === "ENOENT") {
    return { props: {} }; // will render the 404 error
  }

  return {
    props: { ...previewProps.props },
  };
};

export const getStaticPaths = async function () {
  const docs = await fg(`./content/docs/**/*.md`);
  return {
    paths: docs.map((file) => {
      const slug = fileToUrl(file, "docs");
      return { params: { slug } };
    }),
    fallback: true,
  };
};
