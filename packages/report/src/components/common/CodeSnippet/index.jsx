import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import hljs from 'highlight.js/lib/core';

import 'highlight.js/styles/atom-one-light.css';

// Register hljs languages
hljs.registerLanguage(
    'javascript',
    require('highlight.js/lib/languages/javascript')
);
hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'));

const isArray = (value) => value && Array.isArray(value);

const Pre = styled.pre`
    position: relative;
    font-size: 11px;
    margin: 0;
    border-radius: 0;
    padding: 1em;
    background: none;

    & + & {
        border-top: 1px solid #fff;
    }

    ${(props) =>
        props.diff &&
        `
      & code > span:first-child {
        margin-right: 11px;
      }
    `}

    ${(props) => props.styles && props.styles}
`;

const Label = styled.span`
    position: absolute;
    font-family: ${(props) => props.theme.font.base.family};
    top: 0;
    right: 0;
    padding: 0.2em 0.6em;
    background-color: ${(props) => props.theme.color.grey500};
    color: #fff;
`;

const DiffActual = styled.span`
    & span {
        color: #e45649; /* .hljs-deletion */
    }

    ${(props) =>
        props.inline &&
        `
      background-color: #e45649; /* .hljs-deletion */
      color: #fff;
    `}
`;

const DiffExpected = styled.span`
    & span {
        color: #50a14f; /* .hljs-addition */
    }

    ${(props) =>
        props.inline &&
        `
      background-color: #50a14f; /* .hljs-addition */
      color: #fff;
    `}
`;

const CodeSnippet = React.memo(
    ({ code, highlight, lang, label, showLabel, styles }) => {
        const shouldHighlight =
            !(lang === 'diff' && isArray(code)) && code && highlight;

        // instead of useRef + useEffect for componentDidMount like pattern
        // useCallback should be used: https://reactjs.org/docs/hooks-faq.html?source=post_page-----eb7c15198780----------------------#how-can-i-measure-a-dom-node
        // only works when component never changes, so create one instance per code snippet
        // TODO: apply to chart as well
        const preRef = useCallback(
            (node) => {
                if (node && shouldHighlight) {
                    hljs.highlightBlock(node);
                }
            },
            [shouldHighlight]
        );

        const isDiff = lang === 'diff';
        const isInlineDiff = isDiff && isArray(code);
        const classNames = `hljs ${shouldHighlight ? lang : ''}`;

        const renderLegendLeft = () =>
            isInlineDiff ? (
                <DiffActual inline={isInlineDiff}>actual</DiffActual>
            ) : (
                <DiffExpected inline={isInlineDiff}>+ expected</DiffExpected>
            );

        const renderLegendRight = () =>
            isInlineDiff ? (
                <DiffExpected inline={isInlineDiff}>
                    {'expected\n\n'}
                </DiffExpected>
            ) : (
                <DiffActual inline={isInlineDiff}>{'- actual\n\n'}</DiffActual>
            );

        const mapInlineDiffCode = ({ added, removed, value }, i) => {
            if (added) {
                return (
                    <DiffExpected inline={isInlineDiff} key={i}>
                        {value}
                    </DiffExpected>
                );
            }

            if (removed) {
                return (
                    <DiffActual inline={isInlineDiff} key={i}>
                        {value}
                    </DiffActual>
                );
            }

            return value;
        };

        return (
            !!code && (
                <Pre
                    ref={preRef}
                    styles={styles}
                    diff={isDiff}
                    className={classNames}>
                    <code>
                        {isDiff && renderLegendLeft()}
                        {isDiff && renderLegendRight()}
                        {isInlineDiff ? code.map(mapInlineDiffCode) : code}
                    </code>
                    {!!label && showLabel && <Label>{label}</Label>}
                </Pre>
            )
        );
    }
);

CodeSnippet.propTypes = {
    code: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
    lang: PropTypes.string,
    highlight: PropTypes.bool,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    styles: PropTypes.string,
};

CodeSnippet.defaultProps = {
    lang: 'javascript',
    highlight: true,
    label: null,
    showLabel: false,
    styles: null,
};

CodeSnippet.displayName = 'CodeSnippet';

export default CodeSnippet;
