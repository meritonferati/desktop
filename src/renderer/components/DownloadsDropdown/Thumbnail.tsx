// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ConfigDownloadItem} from 'types/config';

type OwnProps = {
    item: ConfigDownloadItem;
}

const Thumbnail = ({item}: OwnProps) => {
    return (
        <div className='DownloadsDropdown__File_Preview'>
            <svg
                width='32'
                height='42'
                viewBox='0 0 32 42'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
            >
                <path
                    d='M28 0.984048H11.92C11.088 0.984048 10.384 1.27205 9.808 1.84805L0.88 10.632C0.304 11.272 0.0160005 11.992 0.0160005 12.792V36.984C0.0160005 38.104 0.400001 39.048 1.168 39.816C1.968 40.616 2.912 41.016 4 41.016H28C29.088 41.016 30.016 40.616 30.784 39.816C31.584 39.048 31.984 38.104 31.984 36.984V5.01605C31.984 3.89605 31.584 2.95205 30.784 2.18405C30.016 1.38405 29.088 0.984048 28 0.984048ZM10 4.48805V11.976H2.368L10 4.48805ZM30.016 36.984C30.016 37.528 29.808 37.992 29.392 38.376C29.008 38.792 28.544 39 28 39H4C3.456 39 2.976 38.792 2.56 38.376C2.176 37.992 1.984 37.528 1.984 36.984V13.992H10C10.544 13.992 11.008 13.8 11.392 13.416C11.808 13 12.016 12.52 12.016 11.976V3.00005H28C28.544 3.00005 29.008 3.20805 29.392 3.62405C29.808 4.00805 30.016 4.47205 30.016 5.01605V36.984ZM22.24 24.936C22.144 24.84 22.016 24.792 21.856 24.792C21.728 24.792 21.616 24.84 21.52 24.936L15.616 30.888C15.168 31.304 14.656 31.592 14.08 31.752C13.536 31.88 12.992 31.88 12.448 31.752C11.904 31.592 11.408 31.304 10.96 30.888C10.576 30.536 10.304 30.04 10.144 29.4C9.952 28.824 9.936 28.248 10.096 27.672C10.288 27.096 10.576 26.616 10.96 26.232L17.632 19.56C17.92 19.272 18.208 19.112 18.496 19.08C18.848 18.984 19.168 18.968 19.456 19.032C19.776 19.096 20.08 19.272 20.368 19.56C20.592 19.784 20.752 20.072 20.848 20.424C20.944 20.744 20.944 21.08 20.848 21.432C20.752 21.72 20.592 22.008 20.368 22.296L14.32 28.344C14.224 28.44 14.08 28.488 13.888 28.488C13.792 28.488 13.664 28.44 13.504 28.344C13.376 28.152 13.312 28.008 13.312 27.912C13.312 27.784 13.376 27.656 13.504 27.528L18.784 22.248C18.88 22.12 18.928 21.992 18.928 21.864C18.928 21.736 18.88 21.624 18.784 21.528L18.064 20.808C17.968 20.712 17.856 20.664 17.728 20.664C17.6 20.664 17.488 20.712 17.392 20.808L12.112 26.088C11.76 26.44 11.536 26.824 11.44 27.24V27.288C11.312 27.704 11.312 28.136 11.44 28.584C11.536 29 11.744 29.384 12.064 29.736C12.384 30.088 12.768 30.312 13.216 30.408C13.696 30.504 14.144 30.504 14.56 30.408C15.008 30.312 15.408 30.088 15.76 29.736L21.76 23.688C22.24 23.24 22.592 22.648 22.816 21.912C22.976 21.24 22.96 20.568 22.768 19.896C22.608 19.224 22.272 18.648 21.76 18.168C21.28 17.656 20.704 17.32 20.032 17.16C19.36 16.968 18.688 16.952 18.016 17.112C17.312 17.304 16.72 17.64 16.24 18.12L9.568 24.84C8.864 25.544 8.4 26.344 8.176 27.24C7.952 28.104 7.952 28.984 8.176 29.88C8.4 30.776 8.864 31.576 9.568 32.28C10.272 32.984 11.072 33.448 11.968 33.672C12.864 33.896 13.76 33.896 14.656 33.672C15.552 33.416 16.336 32.952 17.008 32.28L22.912 26.376C23.04 26.28 23.104 26.168 23.104 26.04C23.104 25.88 23.04 25.752 22.912 25.656L22.24 24.936Z'
                    fill='#999999'
                />
            </svg>

        </div>
    );
};

export default Thumbnail;
