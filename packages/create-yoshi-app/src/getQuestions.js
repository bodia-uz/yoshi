const getGitConfig = require('parse-git-config');
const templates = require('../templates');

const WIX_EMAIL_PATTERN = '@wix.com';

// Use email from git config | OS username or empty string as an initial value.
const getInitialEmail = gitEmail => {
  const processUser = process.env.USER;
  if (gitEmail.endsWith(WIX_EMAIL_PATTERN)) {
    return gitEmail;
  } else if (processUser) {
    return `${processUser}@wix.com`;
  }
  return '';
};

// Format `value` to `value@wix.com` or use original value if it's already contains @wix.com.
const formatEmail = email => {
  if (!email.endsWith(WIX_EMAIL_PATTERN)) {
    return `${email}@wix.com`;
  }
  return email;
};

// Check if string is not in an email format.
const withoutEmail = value => value.length && !/@+/.test(value);

module.exports = () => {
  const gitConfig = getGitConfig.sync({ include: true, type: 'global' });

  const gitUser = gitConfig.user || {};
  const gitName = gitUser.name || '';
  const gitEmail = gitUser.email || '';

  return [
    {
      type: 'text',
      name: 'authorName',
      message: 'Author name',
      initial: gitName,
    },
    {
      type: 'text',
      name: 'authorEmail',
      message: 'Author @wix.com email',
      initial: getInitialEmail(gitEmail),
      format: formatEmail,
      validate: value =>
        // We can add @wix.com if no email pattern detected or force user to write @wix email if different one specified.
        withoutEmail(value) || value.endsWith(WIX_EMAIL_PATTERN)
          ? true
          : 'Please enter a @wix.com email',
    },
    {
      type: 'select',
      name: 'templateDefinition',
      message: 'Choose project type',
      choices: templates.map(project => ({
        title: project.name,
        value: project,
      })),
    },
    {
      type: 'select',
      name: 'transpiler',
      message: 'Choose JavaScript Transpiler',
      choices: [
        { title: 'Typescript', value: 'typescript' },
        { title: 'Babel', value: 'babel' },
      ],
    },
  ];
};
