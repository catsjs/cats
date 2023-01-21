import React from 'react';
import styled, { keyframes } from 'styled-components';
import { transparentize } from 'polished';

import { useStore } from '../StoreProvider';
import { media } from '../../../style/theme';

const Component = styled.div`
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: ${(props) => transparentize(0.6, props.theme.color.body)};
    padding-top: ${(props) => props.theme.navbar.default.height};

    ${media.greaterThan('small')`
      padding-top: ${(props) => props.theme.navbar.short.height};
    `}
`;

const Wrap = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    min-height: 200px;
`;

const spin = keyframes`
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
`;

const Text = styled.h4`
    color: ${(props) => props.theme.color.gray.light};
    text-align: center;
    margin: 1rem 0 0 0;
`;

const Spinner = styled.div`
    border-radius: 50%;
    width: 42px;
    height: 42px;
    border: 0.25rem solid ${(props) => props.theme.color.gray.medium};
    border-top-color: ${(props) => props.theme.color.black};
    animation: ${spin} 1s infinite linear;
`;

const Loader = () => {
    const { isLoading } = useStore();
    return (
        isLoading && (
            <Component>
                <Wrap>
                    <Spinner />
                    <Text>Generating Report</Text>
                </Wrap>
            </Component>
        )
    );
};

export default Loader;
