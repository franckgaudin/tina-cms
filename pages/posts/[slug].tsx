import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import {
  useGithubMarkdownForm,
  useGithubToolbarPlugins,
} from "react-tinacms-github";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import markdownToHtml from "../../lib/markdownToHtml";
import PostType from "../../types/post";
import { getGithubPreviewProps, parseMarkdown } from "next-tinacms-github";
import { useForm, usePlugin, useLocalForm, useCMS } from "tinacms";
import { FORM_ERROR } from "final-form";

type Props = {
  post: PostType;
  morePosts: PostType[];
  preview?: boolean;
};

const Post: React.FC<Props> = ({ post: initialPost }) => {
  const router = useRouter();
  if (!router.isFallback && !initialPost?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  const cms = useCMS();
  const github = cms.api.github;

  const formOptions = {
    id: initialPost.slug, // a unique identifier for this instance of the form
    label: "Blog Post", // name of the form to appear in the sidebar
    initialValues: initialPost, // populate the form with starting values
    onSubmit: (formData) => {
      // do something with the data when the form is submitted
      // return github
      //   .commit(post.fileRelativePath, sha, formData, "Update from TinaCMS")
      //   .then((response: { content: { sha: string } }) => {
      //     cms.alerts.success(
      //       `Saved Successfully: Changes committed to ${github.workingRepoFullName}`
      //     );
      //     // setSha(response.content.sha);
      //   })
      //   .catch((error: any) => {
      //     cms.events.dispatch({ type: "github:error", error });

      //     return { [FORM_ERROR]: error };
      //   });
    },
    fields: [
      // define fields to appear in the form
      {
        name: "title", // field name maps to the corresponding key in initialValues
        label: "Post Title", // label that appears above the field
        component: "text", // the component used to handle UI and input to the field
      },
      {
        name: "rawMarkdownBody", // remember we want `rawMarkdownBody`, not `content` here
        label: "Content",
        component: "markdown", // `component` accepts a predefined components or a custom React component
      },
    ],
  };

  const [post, form] = useLocalForm(formOptions);
  usePlugin(form);

  const [htmlContent, setHtmlContent] = useState(post.content);
  const initialContent = useMemo(() => post.rawMarkdownBody, []);

  useEffect(() => {
    if (initialContent == post.rawMarkdownBody) return;
    markdownToHtml(post.rawMarkdownBody).then(setHtmlContent);
  }, [post.rawMarkdownBody]);

  useGithubToolbarPlugins();
  return (
    <>
      <article>
        <section>
          <h1>{post.title}</h1>
          <p>{post.date}</p>
          <p>{post.author.name}</p>
        </section>
        <section>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </section>
      </article>
    </>
  );
};

export default Post;

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params, preview, previewData }: Params) {
  const post = getPostBySlug(params.slug, [
    "title",
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
    "coverImage",
  ]);
  const content = await markdownToHtml(post.content || "");

  if (preview) {
    // const githubPreviewProps = await getGithubPreviewProps({
    //   ...previewData,
    //   fileRelativePath: `content/posts/${params.slug}.md`,
    //   parse: parseMarkdown,
    // });

    // const sha = githubPreviewProps.props.file.sha;

    return {
      props: {
        ...previewData,
        post: {
          ...post,
          content,
          rawMarkdownBody: post.content,
          fileRelativePath: `content/posts/${params.slug}.md`,
        },
        preview: true,
      },
    };
  }

  return {
    props: {
      post: {
        ...post,
        content,
        rawMarkdownBody: post.content,
      },
      preview: false,
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map((posts) => {
      return {
        params: {
          slug: posts.slug,
        },
      };
    }),
    fallback: false,
  };
}
