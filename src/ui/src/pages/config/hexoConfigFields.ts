import { get } from "lodash-es";

export interface ConfigField<T = unknown> {
  key: string;
  label: string;
  defaultVal: T;
  value?: T;
  description: string;
  placeholder?: string;
  type: "string" | "number" | "boolean" | "select";
  options?: string[];
}

export interface ConfigGroup {
  /** 分组显示名（中英） */
  label: string;

  // 分组唯一标识符（英文）
  key?: string;

  /** 本组字段 */
  fields: (ConfigField | ConfigGroup)[];
}

const hexoConfigGroups: ConfigGroup[] = [
  {
    label: "Site / 站点基本信息",
    fields: [
      {
        key: "title",
        label: "Title / 站点标题",
        defaultVal: "Hexo",
        description: "title of site",
        type: "string",
      },
      {
        key: "subtitle",
        label: "Subtitle / 副标题",
        defaultVal: "",
        description: "subtitle of site",
        type: "string",
      },
      {
        key: "description",
        label: "Description / 站点描述",
        defaultVal: "",
        description: "description of site",
        type: "string",
      },
      {
        key: "keywords",
        label: "Keywords / 关键字",
        defaultVal: "",
        description: "comma-separated keywords",
        type: "string",
      },
      {
        key: "author",
        label: "Author / 作者",
        defaultVal: "John Doe",
        description: "author name",
        type: "string",
      },
      {
        key: "language",
        label: "Language / 语言",
        defaultVal: "en",
        description: "2-letter code",
        type: "string",
      },
      {
        key: "timezone",
        label: "Timezone / 时区",
        defaultVal: "",
        description: "IANA timezone",
        type: "string",
      },
    ],
  },

  {
    label: "URL & Permalink",
    fields: [
      {
        key: "url",
        label: "URL / 站点 URL",
        defaultVal: "http://example.com",
        description: "must start with http/https",
        type: "string",
      },
      {
        key: "permalink",
        label: "Permalink / 文章链接格式",
        defaultVal: ":year/:month/:day/:title/",
        description: "permalink pattern",
        type: "string",
      },
      {
        key: "permalink_defaults",
        label: "Permalink Defaults / 链接默认值",
        defaultVal: null,
        description: "default params",
        type: "string",
      },

      {
        label: "Pretty URLs / 美化 URL",
        key: "pretty_urls",
        fields: [
          {
            key: "trailing_index",
            label: "Remove index.html / 去掉 index.html",
            defaultVal: true,
            description: "trailing_index",
            type: "boolean",
          },
          {
            key: "trailing_html",
            label: "Remove .html / 去掉 .html",
            defaultVal: true,
            description: "trailing_html",
            type: "boolean",
          },
        ],
      },
    ],
  },

  {
    label: "Directories / 目录设置",
    fields: [
      {
        key: "source_dir",
        label: "Source Dir / 源目录",
        defaultVal: "source",
        description: "content folder",
        type: "string",
      },
      {
        key: "public_dir",
        label: "Public Dir / 发布目录",
        defaultVal: "public",
        description: "static output",
        type: "string",
      },
      {
        key: "tag_dir",
        label: "Tag Dir / 标签目录",
        defaultVal: "tags",
        description: "tag folder",
        type: "string",
      },
      {
        key: "archive_dir",
        label: "Archive Dir / 归档目录",
        defaultVal: "archives",
        description: "archive folder",
        type: "string",
      },
      {
        key: "category_dir",
        label: "Category Dir / 分类目录",
        defaultVal: "categories",
        description: "category folder",
        type: "string",
      },
      {
        key: "code_dir",
        label: "Code Dir / 代码目录",
        defaultVal: "downloads/code",
        description: "include code",
        type: "string",
      },
      {
        key: "i18n_dir",
        label: "i18n Dir / 多语言目录",
        defaultVal: ":lang",
        description: "i18n folder",
        type: "string",
      },
      {
        key: "skip_render",
        label: "Skip Render / 跳过渲染",
        defaultVal: null,
        description: "glob patterns",
        type: "string",
      },
    ],
  },

  {
    label: "Writing / 写作设置",
    fields: [
      {
        key: "new_post_name",
        label: "New Post Name / 新文章文件名",
        defaultVal: ":title.md",
        description: "filename pattern",
        type: "string",
      },
      {
        key: "default_layout",
        label: "Default Layout / 默认布局",
        defaultVal: "post",
        description: "post / page",
        type: "string",
      },
      {
        key: "titlecase",
        label: "TitleCase / 标题",
        defaultVal: false,
        description: "transform titles",
        type: "boolean",
      },
      {
        label: "External Link / 外链",
        key: "external_link",
        fields: [
          {
            key: "enable",
            label: "Enable / 外链新窗口",
            defaultVal: true,
            description: "open in new tab",
            type: "boolean",
          },
          {
            key: "field",
            label: "Scope / 外链作用域",
            defaultVal: "site",
            description: "site | post",
            type: "string",
          },
          {
            key: "exclude",
            label: "Exclude / 外链排除",
            defaultVal: "",
            description: "exclude hosts",
            type: "string",
          },
        ],
      },
      {
        key: "filename_case",
        label: "Filename Case / 文件名大小写",
        defaultVal: 0,
        description: "0 none, 1 lower, 2 upper",
        type: "number",
      },
      {
        key: "render_drafts",
        label: "Render Drafts / 渲染草稿",
        defaultVal: false,
        description: "display drafts",
        type: "boolean",
      },
      {
        key: "post_asset_folder",
        label: "Asset Folder / 资源文件夹",
        defaultVal: false,
        description: "enable asset folder",
        type: "boolean",
      },
      {
        key: "relative_link",
        label: "Relative Link / 相对链接",
        defaultVal: false,
        description: "make links relative",
        type: "boolean",
      },
      {
        key: "future",
        label: "Show Future Posts / 发布未来文章",
        defaultVal: true,
        description: "show future posts",
        type: "boolean",
      },
    ],
  },

  {
    label: "Highlight / 代码高亮",
    fields: [
      {
        key: "syntax_highlighter",
        label: "Syntax Highlighter / 高亮器",
        defaultVal: "highlight.js",
        description: "highlight.js | prismjs",
        type: "string",
      },
      {
        label: "Highlight / highlight.js",
        key: "highlight",
        fields: [
          {
            key: "line_number",
            label: "Line Number / 行号",
            defaultVal: true,
            description: "line_number",
            type: "boolean",
          },
          {
            key: "auto_detect",
            label: "Auto Detect / 自动检测语言",
            defaultVal: false,
            description: "auto_detect",
            type: "boolean",
          },
          {
            key: "tab_replace",
            label: "Tab Replace / Tab 替换",
            defaultVal: "",
            description: "tab_replace",
            type: "string",
          },
          {
            key: "wrap",
            label: "Wrap / 代码包装",
            defaultVal: true,
            description: "wrap",
            type: "boolean",
          },
          {
            key: "hljs",
            label: "HLJS Class / HLJS 类",
            defaultVal: false,
            description: "hljs",
            type: "boolean",
          },
        ],
      },
      {
        label: "PrismJS",
        key: "prismjs",
        fields: [
          {
            key: "preprocess",
            label: "Prism Preprocess / Prism 预处理",
            defaultVal: true,
            description: "preprocess",
            type: "boolean",
          },
          {
            key: "line_number",
            label: "Prism Line Number / Prism 行号",
            defaultVal: true,
            description: "line_number",
            type: "boolean",
          },
          {
            key: "tab_replace",
            label: "Prism Tab Replace / Prism Tab 替换",
            defaultVal: "",
            description: "tab_replace",
            type: "string",
          },
        ],
      },
    ],
  },

  {
    label: "Index / 首页生成器",
    fields: [
      {
        label: "Index Generator / 首页生成器",
        key: "index_generator",
        fields: [
          {
            key: "path",
            label: "Index Path / 首页路径",
            defaultVal: "",
            description: "path",
            type: "string",
          },
          {
            key: "per_page",
            label: "Posts Per Page / 每页文章数",
            defaultVal: 10,
            description: "per_page",
            type: "number",
          },
          {
            key: "order_by",
            label: "Order By / 排序字段",
            defaultVal: "-date",
            description: "order_by",
            type: "string",
          },
        ],
      },
    ],
  },

  {
    label: "Category & Tag / 分类 & 标签",
    fields: [
      {
        key: "default_category",
        label: "Default Category / 默认分类",
        defaultVal: "uncategorized",
        description: "default_category",
        type: "string",
      },
      {
        key: "category_map",
        label: "Category Map / 分类映射",
        defaultVal: null,
        description: "override category slugs",
        type: "string",
      },
      {
        key: "tag_map",
        label: "Tag Map / 标签映射",
        defaultVal: null,
        description: "override tag slugs",
        type: "string",
      },
    ],
  },

  {
    label: "Pagination / 分页",
    fields: [
      {
        key: "per_page",
        label: "Posts Per Page / 每页文章数",
        defaultVal: 10,
        description: "global per_page",
        type: "number",
      },
      {
        key: "pagination_dir",
        label: "Pagination Dir / 分页目录",
        defaultVal: "page",
        description: "pagination_dir",
        type: "string",
      },
    ],
  },

  {
    label: "Meta & Date Format / Meta & 时间格式",
    fields: [
      {
        key: "meta_generator",
        label: "Meta Generator / Meta 标签",
        defaultVal: true,
        description: "inject meta generator tag",
        type: "boolean",
      },
      {
        key: "date_format",
        label: "Date Format / 日期格式",
        defaultVal: "YYYY-MM-DD",
        description: "moment date format",
        type: "string",
      },
      {
        key: "time_format",
        label: "Time Format / 时间格式",
        defaultVal: "HH:mm:ss",
        description: "moment time format",
        type: "string",
      },
      {
        key: "updated_option",
        label: "Updated Option / 更新时间策略",
        defaultVal: "mtime",
        description: "mtime | date | empty",
        type: "string",
      },
    ],
  },

  {
    label: "Include & Exclude / 包含 & 排除 & 其它",
    fields: [
      {
        key: "include",
        label: "Include / 包含文件",
        defaultVal: null,
        description: "include patterns",
        type: "string",
      },
      {
        key: "exclude",
        label: "Exclude / 排除文件",
        defaultVal: null,
        description: "exclude patterns",
        type: "string",
      },
      {
        key: "ignore",
        label: "Ignore / 忽略文件",
        defaultVal: null,
        description: "ignore patterns",
        type: "string",
      },
    ],
  },

  {
    label: "Theme & Deploy / 主题 & 部署",
    fields: [
      {
        key: "theme",
        label: "Theme / 主题名",
        defaultVal: "landscape",
        description: "theme name",
        type: "string",
      },
      {
        label: "Deploy / 部署",
        key: "deploy",
        fields: [
          {
            key: "type",
            label: "Deploy Type / 部署类型",
            defaultVal: "",
            description: "deployment type",
            type: "string",
          },
        ],
      },
    ],
  },

  {
    label: "Other / 其它",
    fields: [],
  },
];

export function populateConfigFieldValues(
  config: Record<string, any>,
  groups: ConfigGroup[] = hexoConfigGroups,
  parentKey: string | null = null,
): ConfigGroup[] {
  for (const group of groups) {
    for (const field of group.fields) {
      if ("fields" in field) {
        // 递归处理子分组
        populateConfigFieldValues(config, [field as ConfigGroup], field.key);
      } else {
        const path = parentKey ? `${parentKey}.${field.key}` : field.key;
        field.value = get(config, path);
      }
    }
  }
  return groups;
}

/**
 * 从 ConfigGroup[] 结构生成 config 对象（只传 groups）
 */
export function extractConfigFromGroups(
  groups: ConfigGroup[],
): Record<string, any> {
  function helper(
    groups: ConfigGroup[],
    parentKey: string | null,
    config: Record<string, any>,
  ) {
    for (const group of groups) {
      for (const field of group.fields) {
        if ("fields" in field) {
          helper([field as ConfigGroup], field.key, config);
        } else {
          const path = parentKey ? `${parentKey}.${field.key}` : field.key;
          const keys = path.split(".");
          let obj = config;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
          }
          obj[keys[keys.length - 1]] = field.value ?? field.defaultVal;
        }
      }
    }
  }
  const config: Record<string, any> = {};
  helper(groups, null, config);
  return config;
}
