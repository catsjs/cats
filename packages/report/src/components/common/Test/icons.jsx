import React from 'react';
// import PropTypes from 'prop-types';

const TestIcon = () => <span>t</span>;

export { TestIcon };

// TODO: hook icon
/*

const TestIcon = styled(Icon).attrs((props) => ({
    name: props.pass
        ? 'check'
        : props.fail
        ? 'close'
        : props.pending
        ? 'paused'
        : props.skipped
        ? 'stop'
        : props.hook
        ? props.fail
            ? 'error_outline'
            : props.before
            ? 'rotate_left'
            : 'rotate_right'
        : null,
    size: props.hook ? 24 : 18,
}))`
    align-self: flex-start;
    padding: 3px;
    border-radius: 50%;
    color: #fff;
    margin-right: 16px;

    ${(props) =>
        props.pass &&
        `
      color: ${props.theme.color.green100};
      background-color: ${props.theme.color.green500};
    `}

    ${(props) =>
        props.fail &&
        `
      color: ${props.theme.color.red100};
      background-color: ${props.theme.color.red500};
    `}

    ${(props) =>
        props.pending &&
        `
      color: ${props.theme.color.ltblue100};
      background-color: ${props.theme.color.ltblue500};
    `}

    ${(props) =>
        props.skipped &&
        `
      color: ${props.theme.color.grey100};
      background-color: ${props.theme.color.grey500};
    `}

    ${(props) =>
        props.hook &&
        `
      color: ${props.theme.color.black38};
      padding: 0;

      ${
          props.fail &&
          `
        color: ${props.theme.color.red500};
      `
      }
    `}
`;

*/
