const core = require("@actions/core");
const github = require("@actions/github");
const context = github.context;

async function run() {
  const pullRequestAuthor = context.payload.sender && context.payload.sender.login;

  if (!pullRequestAuthor) {
    console.log("context.payload");
    console.log(context.payload);
    throw new Error("Could not get pull request author.");
  }

  const octokit = github.getOctokit(core.getInput("repo-token", { required: true }));
  if (!octokit) {
    throw new Error("Failed to retrieve octokit instance. Is the repo-token incorrect?");
  }

  // getInput returns a string
  // possibleAssignees holds an array of github user login names
  console.log("got pr author:", pullRequestAuthor);
  console.log("input:", core.getInput("reviewers"));
  const possibleAssignees = core.getInput("reviewers", { required: true })
    .split("\n")
    .map(s => s.trim())
    .filter(x => x !== "" && x !== pullRequestAuthor);

  if (possibleAssignees.length < 1) {
    throw new Error("you need to specify at least one possible reviewer that is not the author");
  }

  console.log("Potential Assignees List", possibleAssignees);

  // do a random selection
  const randomIndex = Math.floor(Math.random() * (possibleAssignees.length));
  // output a number of random samples to debug
  for (let i = 0; i<10; i++) {
    const randomVal = Math.random() * (possibleAssignees.length);
    console.log("raw", randomVal);
    console.log("rounded", Math.floor(randomVal));
  }
  console.log("Selected randomIndex", randomIndex);
  const newAssignee = possibleAssignees[randomIndex];
  console.log("Selected assignee:", newAssignee);

  await octokit.issues.addAssignees({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number,
    assignees: [newAssignee],
  });
  

}


try {
  run();
}
catch (e) {
  core.setFailed(e.message);
}
