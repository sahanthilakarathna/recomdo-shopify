import { shopifyAPICall, shopifyPutAPICall } from "../../helper/connection";

export const InitSearch = async (session) => {
  console.log("Init search start");
  const activeTheme = await getActiveTheme(session);
  var themeLiquidContent = await shopifyAPICall(
    `themes/${activeTheme.id}/assets`,
    null,
    session,
    `asset[key]=layout/theme.liquid&theme_id=${activeTheme.id}`,
  );
  themeLiquidContent = themeLiquidContent.asset.value;

  var recomdoLiquidContent = themeLiquidContent.replace(
    '<script src="{{ \'predictive-search.js\' | asset_url }}" defer="defer"></script>',
    '<!-- <script src="{{ \'predictive-search.js\' | asset_url }}" defer="defer"></script> -->',
  );
  var body = {
    asset: {
      key: "layout/theme.liquid",
      value: recomdoLiquidContent,
    },
  };
  await shopifyPutAPICall(
    `themes/${activeTheme.id}/assets`,
    null,
    session,
    null,
    body,
  );
  console.log("Init search end");
};

const getActiveTheme = async (session) => {
  const themes = await shopifyAPICall("themes", null, session, null);
  console.log("THEMES", themes);
  for (const theme of themes.themes) {
    if (theme.role == "main") {
      return theme;
    }
  }
};
