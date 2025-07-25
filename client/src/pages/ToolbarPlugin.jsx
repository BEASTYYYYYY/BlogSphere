/* eslint-disable react-hooks/exhaustive-deps */
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    $createParagraphNode,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND
} from 'lexical';

import { $setBlocksType } from '@lexical/selection';
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode
} from '@lexical/rich-text';
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    $isListNode
} from '@lexical/list';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState, useCallback } from 'react';
import {
    $getSelectionStyleValueForProperty,
    $patchStyleText
} from '@lexical/selection';
import React from 'react';
import { useTheme } from '../App';

const FONT_FAMILY_OPTIONS = [
    ['Arial', 'Arial, sans-serif'],
    ['Helvetica', 'Helvetica, Arial, sans-serif'],
    ['Times New Roman', 'Times New Roman, serif'],
    ['Times', 'Times, serif'],
    ['Georgia', 'Georgia, serif'],
    ['Garamond', 'Garamond, serif'],
    ['Book Antiqua', 'Book Antiqua, serif'],
    ['Palatino', 'Palatino, serif'],
    ['Verdana', 'Verdana, sans-serif'],
    ['Trebuchet MS', 'Trebuchet MS, sans-serif'],
    ['Tahoma', 'Tahoma, sans-serif'],
    ['Century Gothic', 'Century Gothic, sans-serif'],
    ['Franklin Gothic', 'Franklin Gothic Medium, sans-serif'],
    ['Lucida Sans', 'Lucida Sans Unicode, sans-serif'],
    ['Courier New', 'Courier New, monospace'],
    ['Monaco', 'Monaco, monospace'],
    ['Consolas', 'Consolas, monospace'],
    ['Lucida Console', 'Lucida Console, monospace'],
    ['Comic Sans MS', 'Comic Sans MS, cursive'],
    ['Brush Script MT', 'Brush Script MT, cursive'],
    ['Impact', 'Impact, sans-serif'],
    ['Arial Black', 'Arial Black, sans-serif'],
];

const FONT_SIZE_OPTIONS = [
    ['8', '8px'],
    ['9', '9px'],
    ['10', '10px'],
    ['11', '11px'],
    ['12', '12px'],
    ['14', '14px'],
    ['16', '16px'],
    ['18', '18px'],
    ['20', '20px'],
    ['22', '22px'],
    ['24', '24px'],
    ['26', '26px'],
    ['28', '28px'],
    ['36', '36px'],
    ['48', '48px'],
    ['60', '60px'],
    ['72', '72px'],
];
const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    'Objects': ['❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '⭐', '🌟', '💫', '⚡', '☄️', '💥', '🔥', '🌈', '☀️', '🌤️', '⛅', '🌦️', '🌧️']
};
const COLOR_PALETTE = [
    // Row 1 - Primary colors
    ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
    // Row 2 - Red tones
    ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
    // Row 3 - Light variants
    ['#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC'],
    // Row 4 - Medium variants  
    ['#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD'],
    // Row 5 - Darker variants
    ['#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0'],
    // Row 6 - Deep variants
    ['#A61E4D', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79'],
    // Row 7 - Professional tones
    ['#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47'],
    // Row 8 - Deep professional
    ['#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'],
];

const STANDARD_COLORS = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#000000', '#FFFFFF', '#800000', '#008000', '#000080', '#808000',
    '#800080', '#008080', '#C0C0C0', '#808080', '#FFA500', '#FFC0CB'
];

export default function AdvancedToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState('paragraph');
    const { darkMode } = useTheme();

    // Format states
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);

    // Style states
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState('14');
    const [fontColor, setFontColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('');

    // Dropdown states
    const [showFontColorPicker, setShowFontColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState('Smileys');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            // Update block type
            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = anchorNode.getParents().find((p) => $isListNode(p));
                    const type = parentList ? parentList.getListType() : element.getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    if (type in blockTypeToBlockName) {
                        setBlockType(type);
                    }
                    if ($isCodeNode(element)) {
                        setBlockType('code');
                    }
                }
            }

            // Update format states
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));

            // Update style states
            const currentFontSize = $getSelectionStyleValueForProperty(selection, 'font-size', '14px');
            setFontSize(currentFontSize.replace('px', ''));
            setFontColor($getSelectionStyleValueForProperty(selection, 'color', '#000000'));
            setBgColor($getSelectionStyleValueForProperty(selection, 'background-color', ''));
            setFontFamily($getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'));
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                updateToolbar();
                return false;
            },
            COMMAND_PRIORITY_CRITICAL,
        );
    }, [editor, updateToolbar]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const historyState = editor._history;
                if (historyState) {
                    setCanUndo(historyState.canUndo());
                    setCanRedo(historyState.canRedo());
                }
            });
        });
    }, [editor]);

    const blockTypeToBlockName = {
        code: 'Code Block',
        h1: 'Heading 1',
        h2: 'Heading 2',
        h3: 'Heading 3',
        h4: 'Heading 4',
        h5: 'Heading 5',
        h6: 'Heading 6',
        paragraph: 'Normal',
        quote: 'Quote',
        bullet: 'Bulleted List',
        number: 'Numbered List',
    };

    const formatText = (format) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const formatParagraph = (blockType) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (blockType === 'paragraph') {
                    $setBlocksType(selection, () => $createParagraphNode());
                } else if (blockType === 'quote') {
                    $setBlocksType(selection, () => $createQuoteNode());
                } else if (blockType === 'code') {
                    $setBlocksType(selection, () => $createCodeNode());
                } else if (blockType.startsWith('h')) {
                    $setBlocksType(selection, () => $createHeadingNode(blockType));
                }
            }
        });
    };

    const formatList = (listType) => {
        if (listType === 'bullet') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else if (listType === 'number') {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const applyStyleText = (styles) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, styles);
            }
        });
    };

    const onFontColorSelect = (value) => {
        applyStyleText({ color: value });
        setShowFontColorPicker(false);
    };

    const onBgColorSelect = (value) => {
        applyStyleText({ 'background-color': value });
        setShowBgColorPicker(false);
    };

    const onFontFamilySelect = (value) => {
        applyStyleText({ 'font-family': value });
    };

    const onFontSizeSelect = (value) => {
        applyStyleText({ 'font-size': value + 'px' });
    };

    const clearFormatting = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();

                nodes.forEach((node) => {
                    if (node.__style) {
                        node.setStyle('');
                    }
                });

                // Clear all text formatting
                ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code'].forEach(format => {
                    selection.formatText(format, false);
                });
            }
        });
    };
    const insertEmoji = (emoji) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.insertText(emoji);
            }
        });
        setShowEmojiPicker(false);
    };
    // Styles
    const toolbarClass = `p-3 border-b flex flex-wrap items-center gap-2 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`;

    const buttonClass = `h-8 px-3 text-sm border rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${darkMode
            ? 'text-white border-gray-600 hover:bg-gray-700'
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        }`;

    const activeButtonClass = `h-8 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${darkMode
            ? 'text-white bg-gray-600 border-gray-500'
            : 'text-white bg-blue-600 border-blue-600'
        }`;

    const selectClass = `h-8 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
            ? 'text-white bg-gray-800 border-gray-600'
            : 'text-gray-700 bg-white border-gray-300'
        }`;

    const separatorClass = `w-px h-6 mx-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`;

    const ColorPicker = ({ colors, onSelect, show, standardColors = false }) => {
        if (!show) return null;

        return (
            <div className="absolute top-full left-0 mt-2 z-50">
                <div className={`p-4 border rounded-lg shadow-lg min-w-[280px] ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                    {standardColors ? (
                        <div className="space-y-3">
                            <div>
                                <h4 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Standard Colors
                                </h4>
                                <div className="grid grid-cols-6 gap-2">
                                    {STANDARD_COLORS.map((color, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className="w-8 h-8 border border-gray-300 rounded-md hover:scale-110 transition-transform shadow-sm"
                                            style={{ backgroundColor: color }}
                                            onClick={() => onSelect(color)}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Theme Colors
                                </h4>
                                <div className="space-y-1">
                                    {colors.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex gap-1">
                                            {row.map((color, colIndex) => (
                                                <button
                                                    key={colIndex}
                                                    type="button"
                                                    className="w-6 h-6 border border-gray-200 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => onSelect(color)}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {colors.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex gap-1">
                                    {row.map((color, colIndex) => (
                                        <button
                                            key={colIndex}
                                            type="button"
                                            className="w-6 h-6 border border-gray-200 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => onSelect(color)}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            className={`text-sm px-3 py-1 rounded-md w-full text-left hover:bg-gray-100 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            onClick={() => onSelect('')}
                        >
                            No Color
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const EmojiPicker = ({ show }) => {
        if (!show) return null;

        return (
            <div className="absolute top-full left-0 mt-2 z-50">
                <div className={`p-4 border rounded-lg shadow-lg w-80 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex border-b mb-3">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                            <button
                                key={category}
                                type="button"
                                className={`px-3 py-2 text-sm font-medium ${activeEmojiCategory === category
                                        ? (darkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600')
                                        : (darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800')
                                    }`}
                                onClick={() => setActiveEmojiCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                        {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, index) => (
                            <button
                                key={index}
                                type="button"
                                className="w-8 h-8 text-lg hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
                                onClick={() => insertEmoji(emoji)}
                                title={emoji}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className={toolbarClass}>
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND)}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                >
                    ↶
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => editor.dispatchCommand(REDO_COMMAND)}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                >
                    ↷
                </button>
            </div>
            <div className={separatorClass}></div>
            {/* Emoji Picker */}
            <div className="flex items-center gap-1">
                <div className="relative">
                    <button
                        type="button"
                        className={buttonClass}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Insert Emoji"
                    >
                        😀
                    </button>
                    <EmojiPicker show={showEmojiPicker} />
                </div>
            </div>
            {/* Font Controls */}
            <div className="flex items-center gap-2">
                <select
                    className={`${selectClass} min-w-[140px]`}
                    value={fontFamily}
                    onChange={(e) => onFontFamilySelect(e.target.value)}
                    title="Font Family"
                >
                    {FONT_FAMILY_OPTIONS.map(([option, value]) => (
                        <option key={option} value={value} style={{ fontFamily: value }}>
                            {option}
                        </option>
                    ))}
                </select>

                <select
                    className={`${selectClass} w-16`}
                    value={fontSize}
                    onChange={(e) => onFontSizeSelect(e.target.value)}
                    title="Font Size"
                >
                    {FONT_SIZE_OPTIONS.map(([option]) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div className={separatorClass}></div>

            {/* Text Formatting */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className={isBold ? activeButtonClass : buttonClass}
                    onClick={() => formatText('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    className={isItalic ? activeButtonClass : buttonClass}
                    onClick={() => formatText('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    className={isUnderline ? activeButtonClass : buttonClass}
                    onClick={() => formatText('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <u>U</u>
                </button>
                <button
                    type="button"
                    className={isStrikethrough ? activeButtonClass : buttonClass}
                    onClick={() => formatText('strikethrough')}
                    title="Strikethrough"
                >
                    <s>S</s>
                </button>
                <button
                    type="button"
                    className={isSubscript ? activeButtonClass : buttonClass}
                    onClick={() => formatText('subscript')}
                    title="Subscript"
                >
                    X₂
                </button>
                <button
                    type="button"
                    className={isSuperscript ? activeButtonClass : buttonClass}
                    onClick={() => formatText('superscript')}
                    title="Superscript"
                >
                    X²
                </button>
            </div>

            <div className={separatorClass}></div>

            {/* Color Controls */}
            <div className="flex items-center gap-1">
                <div className="relative">
                    <button
                        type="button"
                        className={`${buttonClass} flex items-center gap-1`}
                        onClick={() => setShowFontColorPicker(!showFontColorPicker)}
                        title="Font Color"
                    >
                        <span>A</span>
                        <div className="w-4 h-1 rounded-sm" style={{ backgroundColor: fontColor }}></div>
                        <span className="text-xs">▼</span>
                    </button>
                    <ColorPicker
                        colors={COLOR_PALETTE}
                        onSelect={onFontColorSelect}
                        show={showFontColorPicker}
                        standardColors={true}
                    />
                </div>

                <div className="relative">
                    <button
                        type="button"
                        className={`${buttonClass} flex items-center gap-1`}
                        onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                        title="Background Color"
                    >
                        <span>🎨</span>
                        <div className="w-4 h-1 rounded-sm" style={{ backgroundColor: bgColor || '#transparent' }}></div>
                        <span className="text-xs">▼</span>
                    </button>
                    <ColorPicker
                        colors={COLOR_PALETTE}
                        onSelect={onBgColorSelect}
                        show={showBgColorPicker}
                        standardColors={true}
                    />
                </div>
            </div>

            <div className={separatorClass}></div>

            {/* Lists & Indent */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => formatList('bullet')}
                    title="Bullet List"
                >
                    ☰
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => formatList('number')}
                    title="Numbered List"
                >
                    ≡
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND)}
                    title="Decrease Indent"
                >
                    ⫷
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND)}
                    title="Increase Indent"
                >
                    ⫸
                </button>
            </div>

            <div className={separatorClass}></div>

            {/* Block Type */}
            <select
                className={`${selectClass} min-w-[110px]`}
                value={blockType}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'bullet' || value === 'number') {
                        formatList(value);
                    } else {
                        formatParagraph(value);
                    }
                }}
                title="Text Style"
            >
                <option value="paragraph">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
                <option value="quote">Quote</option>
                <option value="code">Code</option>
            </select>

            <div className={separatorClass}></div>

            {/* Additional Tools */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className={buttonClass}
                    onClick={clearFormatting}
                    title="Clear Formatting"
                >
                    🧹
                </button>
            </div>
        </div>
    );
}