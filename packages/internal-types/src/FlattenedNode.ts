export interface FlattenedNode {
  name: string;
  value: string;
  description?: string;
  type: string;
  attributes: {
    isUsingPureReference: boolean;
    invalidForFigmaVariableReason?: string;
    figmaScopes?: VariableScope[];
    figmaType?: VariableResolvedDataType;
  };
  original: {
    name: string;
    value: string;
    type: string;
  };
}
