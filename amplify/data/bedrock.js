export function request(ctx) {
    const { ingredients = [] } = ctx.args;
  
    // Construct the prompt with the provided ingredients
    const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;
  
    // Return the request configuration
    return {
      resourcePath: `/model/us.anthropic.claude-sonnet-4-6/invoke`,
      method: "POST",
      params: {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    };
  }
  
  export function response(ctx) {
    // Bedrock errors (no model access, bad model id, IAM) come back as non-200 with a message body
    // ponytail: TEMPORARY debug aid — raw Bedrock body can leak account ID/ARNs to the client.
    // Replace with a generic message (and util.error for CloudWatch) once generation works.
    if (ctx.result.statusCode !== 200) {
      return { error: `Bedrock ${ctx.result.statusCode}: ${ctx.result.body}` };
    }
    // Parse the response body
    const parsedBody = JSON.parse(ctx.result.body);
    // Extract the text content from the response
    const res = {
      body: parsedBody.content[0].text,
    };
    // Return the response
    return res;
  }