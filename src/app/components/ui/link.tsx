import * as React from "react";
import { Link as RouterLink, LinkProps } from "react-router";

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { _fgT, _fgS, _fgB, _fgt, _fgs, _fgb, ...cleanProps } = props as any;
  return <RouterLink ref={ref} {...cleanProps} />;
});

Link.displayName = "Link";

export { Link };
