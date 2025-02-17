// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle} from 'react-beautiful-dnd';

import {Team, TeamWithTabs, TeamWithTabsAndGpo} from 'types/config';

import {getTabViewName} from 'common/tabs/TabView';
import {TAB_BAR_HEIGHT, THREE_DOT_MENU_WIDTH_MAC} from 'common/utils/constants';

import './css/dropdown.scss';

import IntlProvider from './intl_provider';

type State = {
    teams?: TeamWithTabsAndGpo[];
    orderedTeams?: TeamWithTabsAndGpo[];
    activeTeam?: string;
    darkMode?: boolean;
    enableServerManagement?: boolean;
    unreads?: Map<string, boolean>;
    mentions?: Map<string, number>;
    expired?: Map<string, boolean>;
    hasGPOTeams?: boolean;
    isAnyDragging: boolean;
    windowBounds?: Electron.Rectangle;
}

function getStyle(style?: DraggingStyle | NotDraggingStyle) {
    if (style?.transform) {
        const axisLockY = `translate(0px${style.transform.slice(style.transform.indexOf(','), style.transform.length)}`;
        return {
            ...style,
            transform: axisLockY,
        };
    }
    return style;
}
class TeamDropdown extends React.PureComponent<Record<string, never>, State> {
    buttonRefs: Map<number, HTMLButtonElement>;
    addServerRef: React.RefObject<HTMLButtonElement>;
    focusedIndex: number | null;

    constructor(props: Record<string, never>) {
        super(props);
        this.state = {
            isAnyDragging: false,
        };
        this.focusedIndex = null;

        this.buttonRefs = new Map();
        this.addServerRef = React.createRef();

        window.desktop.serverDropdown.onUpdateServerDropdown(this.handleUpdate);
    }

    handleUpdate = (
        teams: TeamWithTabsAndGpo[],
        darkMode: boolean,
        windowBounds: Electron.Rectangle,
        activeTeam?: string,
        enableServerManagement?: boolean,
        hasGPOTeams?: boolean,
        expired?: Map<string, boolean>,
        mentions?: Map<string, number>,
        unreads?: Map<string, boolean>,
    ) => {
        this.setState({
            teams,
            orderedTeams: teams.concat().sort((a: TeamWithTabs, b: TeamWithTabs) => a.order - b.order),
            activeTeam,
            darkMode,
            enableServerManagement,
            hasGPOTeams,
            unreads,
            mentions,
            expired,
            windowBounds,
        });
    }

    selectServer = (team: Team) => {
        return () => {
            window.desktop.serverDropdown.switchServer(team.name);
            this.closeMenu();
        };
    }

    closeMenu = () => {
        if (!this.state.isAnyDragging) {
            (document.activeElement as HTMLElement).blur();
            window.desktop.closeTeamsDropdown();
        }
    }

    preventPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    }

    addServer = () => {
        window.desktop.serverDropdown.showNewServerModal();
        this.closeMenu();
    }

    isActiveTeam = (team: Team) => {
        return team.name === this.state.activeTeam;
    }

    onDragStart = () => {
        this.setState({isAnyDragging: true});
    }

    onDragEnd = (result: DropResult) => {
        const removedIndex = result.source.index;
        const addedIndex = result.destination?.index;
        if (addedIndex === undefined || removedIndex === addedIndex) {
            this.setState({isAnyDragging: false});
            return;
        }
        if (!this.state.teams) {
            throw new Error('No config');
        }
        const teams = this.state.teams.concat();
        const tabOrder = teams.map((team, index) => {
            return {
                index,
                order: team.order,
            };
        }).sort((a, b) => (a.order - b.order));

        const team = tabOrder.splice(removedIndex, 1);
        const newOrder = addedIndex < this.state.teams.length ? addedIndex : this.state.teams.length - 1;
        tabOrder.splice(newOrder, 0, team[0]);

        tabOrder.forEach((t, order) => {
            teams[t.index].order = order;
        });
        this.setState({teams, orderedTeams: teams.concat().sort((a: Team, b: Team) => a.order - b.order), isAnyDragging: false});
        window.desktop.updateTeams(teams);
    }

    componentDidMount() {
        window.desktop.serverDropdown.requestInfo();
        window.addEventListener('click', this.closeMenu);
        window.addEventListener('keydown', this.handleKeyboardShortcuts);
    }

    componentDidUpdate() {
        window.desktop.serverDropdown.sendSize(document.body.scrollWidth, document.body.scrollHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.closeMenu);
        window.removeEventListener('keydown', this.handleKeyboardShortcuts);
    }

    setButtonRef = (teamIndex: number, refMethod?: (element: HTMLButtonElement) => unknown) => {
        return (ref: HTMLButtonElement) => {
            this.addButtonRef(teamIndex, ref);
            refMethod?.(ref);
        };
    }

    addButtonRef = (teamIndex: number, ref: HTMLButtonElement | null) => {
        if (ref) {
            this.buttonRefs.set(teamIndex, ref);
            ref.addEventListener('focusin', () => {
                this.focusedIndex = teamIndex;
            });
            ref.addEventListener('blur', () => {
                this.focusedIndex = null;
            });
        }
    }

    handleKeyboardShortcuts = (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            if (this.focusedIndex === null) {
                this.focusedIndex = 0;
            } else {
                this.focusedIndex = (this.focusedIndex + 1) % this.buttonRefs.size;
            }
            this.buttonRefs.get(this.focusedIndex)?.focus();
        }
        if (event.key === 'ArrowUp') {
            if (this.focusedIndex === null || this.focusedIndex === 0) {
                this.focusedIndex = this.buttonRefs.size - 1;
            } else {
                this.focusedIndex = (this.focusedIndex - 1) % this.buttonRefs.size;
            }
            this.buttonRefs.get(this.focusedIndex)?.focus();
        }
        if (event.key === 'Escape') {
            this.closeMenu();
        }
        this.buttonRefs.forEach((button, index) => {
            if (event.key === String(index + 1)) {
                button.focus();
            }
        });
    }

    handleClickOnDragHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        if (this.state.isAnyDragging) {
            event.stopPropagation();
        }
    }

    editServer = (teamName: string) => {
        if (this.teamIsGpo(teamName)) {
            return () => {};
        }
        return (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            window.desktop.serverDropdown.showEditServerModal(teamName);
            this.closeMenu();
        };
    }

    removeServer = (teamName: string) => {
        if (this.teamIsGpo(teamName)) {
            return () => {};
        }
        return (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            window.desktop.serverDropdown.showRemoveServerModal(teamName);
            this.closeMenu();
        };
    }

    teamIsGpo = (teamName: string) => {
        return this.state.orderedTeams?.some((team) => team.name === teamName && team.isGpo);
    }

    render() {
        return (
            <IntlProvider>
                <div
                    onClick={this.preventPropagation}
                    className={classNames('TeamDropdown', {
                        darkMode: this.state.darkMode,
                    })}
                    style={{
                        maxHeight: this.state.windowBounds ? (this.state.windowBounds.height - TAB_BAR_HEIGHT - 16) : undefined,
                        maxWidth: this.state.windowBounds ? (this.state.windowBounds.width - THREE_DOT_MENU_WIDTH_MAC) : undefined,
                    }}
                >
                    <div className='TeamDropdown__header'>
                        <span className='TeamDropdown__servers'>
                            <FormattedMessage
                                id='renderer.dropdown.servers'
                                defaultMessage='Servers'
                            />
                        </span>
                        <span className='TeamDropdown__keyboardShortcut'>
                            {window.process.platform === 'darwin' ? '⌃⌘S' : 'Ctrl + Shift + S'}
                        </span>
                    </div>
                    <hr className='TeamDropdown__divider'/>
                    <DragDropContext
                        onDragStart={this.onDragStart}
                        onDragEnd={this.onDragEnd}
                    >
                        <Droppable
                            isDropDisabled={this.state.hasGPOTeams}
                            droppableId='TeamDropdown__droppable'
                        >
                            {(provided) => (
                                <div
                                    className='TeamDropdown__droppable'
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {this.state.orderedTeams?.map((team, orderedIndex) => {
                                        const index = this.state.teams?.indexOf(team);
                                        const {sessionExpired, hasUnreads, mentionCount} = team.tabs.reduce((counts, tab) => {
                                            const tabName = getTabViewName(team.name, tab.name);
                                            counts.sessionExpired = this.state.expired?.get(tabName) || counts.sessionExpired;
                                            counts.hasUnreads = this.state.unreads?.get(tabName) || counts.hasUnreads;
                                            counts.mentionCount += this.state.mentions?.get(tabName) || 0;
                                            return counts;
                                        }, {sessionExpired: false, hasUnreads: false, mentionCount: 0});

                                        let badgeDiv: React.ReactNode;
                                        if (sessionExpired) {
                                            badgeDiv = (
                                                <div className='TeamDropdown__badge-expired'>
                                                    <i className='icon-alert-circle-outline'/>
                                                </div>
                                            );
                                        } else if (mentionCount && mentionCount > 0) {
                                            badgeDiv = (
                                                <div className='TeamDropdown__badge-count'>
                                                    <span>{mentionCount > 99 ? '99+' : mentionCount}</span>
                                                </div>
                                            );
                                        } else if (hasUnreads) {
                                            badgeDiv = (
                                                <div className='TeamDropdown__badge-dot'/>
                                            );
                                        }

                                        return (
                                            <Draggable
                                                key={index}
                                                draggableId={`TeamDropdown__draggable-${index}`}
                                                index={orderedIndex}
                                                disableInteractiveElementBlocking={true}
                                            >
                                                {(provided, snapshot) => (
                                                    <button
                                                        className={classNames('TeamDropdown__button', {
                                                            dragging: snapshot.isDragging,
                                                            anyDragging: this.state.isAnyDragging,
                                                            active: this.isActiveTeam(team),
                                                        })}
                                                        ref={this.setButtonRef(orderedIndex, provided.innerRef)}
                                                        {...provided.draggableProps}
                                                        onClick={this.selectServer(team)}
                                                        style={getStyle(provided.draggableProps.style)}
                                                    >
                                                        <div
                                                            className={classNames('TeamDropdown__draggable-handle', {
                                                                dragging: snapshot.isDragging,
                                                            })}
                                                            {...provided.dragHandleProps}
                                                            onClick={this.handleClickOnDragHandle}
                                                        >
                                                            <i className='icon-drag-vertical'/>
                                                            {this.isActiveTeam(team) ? <i className='icon-check'/> : <i className='icon-server-variant'/>}
                                                            <span>{team.name}</span>
                                                        </div>
                                                        {!team.isGpo && <div className='TeamDropdown__indicators'>
                                                            <button
                                                                className='TeamDropdown__button-edit'
                                                                onClick={this.editServer(team.name)}
                                                            >
                                                                <i className='icon-pencil-outline'/>
                                                            </button>
                                                            <button
                                                                className='TeamDropdown__button-remove'
                                                                onClick={this.removeServer(team.name)}
                                                            >
                                                                <i className='icon-trash-can-outline'/>
                                                            </button>
                                                            {badgeDiv && <div className='TeamDropdown__badge'>
                                                                {badgeDiv}
                                                            </div>}
                                                        </div>}
                                                    </button>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <hr className='TeamDropdown__divider'/>
                    {this.state.enableServerManagement &&
                        <button
                            ref={(ref) => {
                                this.addButtonRef(this.state.orderedTeams?.length || 0, ref);
                            }}
                            className='TeamDropdown__button addServer'
                            onClick={this.addServer}
                        >
                            <i className='icon-plus'/>
                            <FormattedMessage
                                id='renderer.dropdown.addAServer'
                                defaultMessage='Add a server'
                            />
                        </button>
                    }
                </div>
            </IntlProvider>
        );
    }
}

ReactDOM.render(
    <TeamDropdown/>,
    document.getElementById('app'),
);
