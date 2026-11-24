import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";

const backend = defineBackend({
  auth,
  data,
});

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  "https://bedrock-runtime.us-east-2.amazonaws.com",
  {
    authorizationConfig: {
      signingRegion: "us-east-2",
      signingServiceName: "bedrock",
    },
  }
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    // Inference profiles need both: the profile itself, and the model in every US region it may route to.
    resources: [
      `arn:aws:bedrock:us-east-2:${backend.stack.account}:inference-profile/us.anthropic.claude-sonnet-4-6`,
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-6",
    ],
    actions: ["bedrock:InvokeModel"],
    
  })
);