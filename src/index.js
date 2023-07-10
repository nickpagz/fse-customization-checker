import { Spinner } from '@wordpress/components';
import { useState, render, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
 
function FSECustomizationChecker() {
    const [ globalStylesMods, setGlobalStylesMods ] = useState();

    const [ customCSSMods, setCustomCSSMods ] = useState();

    const { templates, hasResolved } = useSelect(
        ( select ) => {
            const selectorArgs = [ 'postType', 'wp_template', { per_page: -1 } ];
            return {
                templates: select( coreDataStore ).getEntityRecords(
                    ...selectorArgs
                ),
                hasResolved: select( coreDataStore ).hasFinishedResolution(
                    'getEntityRecords',
                    selectorArgs
                ),
            };
        },
        []
    );

    const { templateParts, hasPartsResolved } = useSelect(
        ( select ) => {
            const selectorArgs = [ 'postType', 'wp_template_part', { per_page: -1 } ];
            return {
                templateParts: select( coreDataStore ).getEntityRecords(
                    ...selectorArgs
                ),
                hasPartsResolved: select( coreDataStore ).hasFinishedResolution(
                    'getEntityRecords',
                    selectorArgs
                ),
            };
        },
        []
    );

    const { unsyncedPatterns, hasUnsyncedPatternsResolved } = useSelect(
        ( select ) => {
            const selectorArgs = [ 'postType', 'wp_block', { per_page: -1 } ];
            return {
                unsyncedPatterns: select( coreDataStore ).getEntityRecords(
                    ...selectorArgs
                ),
                hasUnsyncedPatternsResolved: select( coreDataStore ).hasFinishedResolution(
                    'getEntityRecords',
                    selectorArgs
                ),
            };
        },
        []
    );

    const { syncedPatterns, hasSyncedPatternsResolved } = useSelect(
        ( select ) => {
            const selectorArgs = [ 'postType', 'wp_block', { per_page: -1 } ];
            return {
                syncedPatterns: select( coreDataStore ).getEntityRecords(
                    ...selectorArgs
                ),
                hasSyncedPatternsResolved: select( coreDataStore ).hasFinishedResolution(
                    'getEntityRecords',
                    selectorArgs
                ),
            };
        },
        []
    );

    useEffect( () => {
        apiFetch( { path: `/fse_customization_checker/v1/customcss` } )
            .then( ( data ) => {
                if(!data) return; // No content.
                console.log('Custom CSS:');
                console.log(data);
                let customCssContent = decodeEntities( data.last_revision_content );
                let customCssContentOriginal = decodeEntities( data.content );
                if ( customCssContent === null ) {
                    customCssContent = customCssContentOriginal;
                }
                //let jsObject = JSON.parse(customCssContent);
                //setCustomCSSMods( jsObject );
                setCustomCSSMods( customCssContent );
            } );
        return;
    }, [] );

	const globalStylesId = useSelect( ( select ) => select( coreDataStore ).__experimentalGetCurrentGlobalStylesId(), [] );

    useEffect( () => {
        if ( ! globalStylesId ) {
            return;
        }

        apiFetch( { path: `/fse_customization_checker/v1/globalstyles/${globalStylesId}` } )
            .then( ( data ) => {
                console.log('Global Styles:');
                console.log(data);
				let globalStylesContent = decodeEntities( data.last_revision_content );
                let globalStylesContentOriginal = decodeEntities( data.content );
                if ( globalStylesContent === null ) {
                    globalStylesContent = globalStylesContentOriginal;
                }
				let jsObject = JSON.parse(globalStylesContent);
                setGlobalStylesMods( jsObject );
            } );
        return;
    }, [ globalStylesId ] );

    if ( ! globalStylesMods ) {
        return <Spinner />;
    }

    
    
  
    return (
        <div>
            <div>
                <details>
                    <summary>
                        <h2>Templates:</h2>
                    </summary>
                    <TemplateList hasResolved={ hasResolved } templates={ templates } />
                </details>
            </div>
            <div>
                <details>
                    <summary>
                        <h2>Template Parts:</h2>
                    </summary>
                    <TemplatePartsList hasPartsResolved={ hasPartsResolved } templateParts={ templateParts } />
                </details>
            </div>
            <div className="fse-customization-checker-global-styles">
                <details>
                    <summary>
                        <h2>Global Styles Overrides:</h2>
                    </summary>
                    <pre>{ JSON.stringify(globalStylesMods, null, 2).replace(/\\n/g, '') }</pre>
                </details>
            </div>
            <div>
                <details>
                    <summary>
                        <h2>Un-synced Patterns:</h2>
                    </summary>
                    <UnsyncedPatternList hasUnsyncedPatternsResolved={ hasUnsyncedPatternsResolved } unsyncedPatterns={ unsyncedPatterns } />
                </details>
            </div>
            <div>
                <details>
                    <summary>
                        <h2>Synced Patterns (formerly Reuseable Blocks):</h2>
                    </summary>
                    <SyncedPatternList hasSyncedPatternsResolved={ hasSyncedPatternsResolved } syncedPatterns={ syncedPatterns } />
                </details>
            </div>
            <div className="fse-customization-checker-global-styles">
                <details>
                    <summary>
                        <h2>Classic Custom CSS:</h2>
                    </summary>
                    <pre>{ customCSSMods }</pre>
                </details>
            </div>
        </div>
    );
}

function TemplatePartsList( { hasPartsResolved, templateParts } ) {
    if ( ! hasPartsResolved ) {
        return <Spinner />;
    }
    if ( ! templateParts?.length ) {
        return <div>No results</div>;
    }
    console.log('Template Parts:');
    console.log(templateParts);
  
    return (
        <table className="wp-list-table widefat fixed striped table-view-list fse-template-parts-table">
            <thead>
                <tr>
                    <td>Template Part</td>
                    <td>Slug</td>
					<td style={{width: 200}}>Customized</td>
                </tr>
            </thead>
            <tbody>
                { templateParts?.map( ( templatePart ) => {
                    let customizedStatus = '';
                    if (templatePart.source === "custom") {
                        if (templatePart.origin === "theme") {
                            customizedStatus = 'Customized theme template part';
                        } else if (templatePart.origin === null) {
                            customizedStatus = 'User generated';
                        }
                    }

                    return (
                        <tr key={ templatePart.id }>
                            <td>{ decodeEntities( templatePart.title.rendered ) }</td>
                            <td>{ templatePart.slug }</td>
                            <td>{ customizedStatus }</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
  
function TemplateList( { hasResolved, templates } ) {
    if ( ! hasResolved ) {
        return <Spinner />;
    }
    if ( ! templates?.length ) {
        return <div>No results</div>;
    }
    console.log('Templates:');
    console.log(templates);
  
    return (
        <table className="wp-list-table widefat fixed striped table-view-list fse-templates-table">
            <thead>
                <tr>
                    <td>Template</td>
                    <td>Slug</td>
					<td style={{width: 200}}>Customized</td>
                </tr>
            </thead>
            <tbody>
                { templates?.map( ( template ) => {
                    let customizedStatus = '';
                    if (template.source === "custom") {
                        if (template.origin === "theme") {
                            customizedStatus = 'Customized theme template';
                        } else if (template.origin === null) {
                            customizedStatus = 'User generated';
                        }
                    }

                    return (
                        <tr key={ template.id }>
                            <td>{ decodeEntities( template.title.rendered ) }</td>
                            <td>{ template.slug }</td>
                            <td>{ customizedStatus }</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function UnsyncedPatternList( { hasUnsyncedPatternsResolved, unsyncedPatterns } ) {
    if ( ! hasUnsyncedPatternsResolved ) {
        return <Spinner />;
    }
    if ( ! unsyncedPatterns?.length ) {
        return <div>No results</div>;
    }
    console.log('Unsynced Patterns:');
  
    return (
        <table className="wp-list-table widefat fixed striped table-view-list fse-template-parts-table">
            <thead>
                <tr>
                    <td>Un-synced Pattern</td>
                    <td>Slug</td>
					<td style={{width: 200}}>Customized</td>
                </tr>
            </thead>
            <tbody>
                { unsyncedPatterns?.map( ( unsyncedPattern ) => {
                    if (unsyncedPattern.meta.wp_pattern_sync_status === "unsynced") {
                        console.log(unsyncedPattern);
                        return (
                            <tr key={ unsyncedPattern.id }>
                                <td>{ decodeEntities( unsyncedPattern.title.raw ) }</td>
                                <td>{ unsyncedPattern.slug }</td>
                                <td>User Generated</td>
                            </tr>
                        );
                    }
                })}
            </tbody>
        </table>
    );
}

function SyncedPatternList( { hasSyncedPatternsResolved, syncedPatterns } ) {
    if ( ! hasSyncedPatternsResolved ) {
        return <Spinner />;
    }
    if ( ! syncedPatterns?.length ) {
        return <div>No results</div>;
    }
    console.log('Synced Patterns:');
  
    return (
        <table className="wp-list-table widefat fixed striped table-view-list fse-template-parts-table">
            <thead>
                <tr>
                    <td>Synced Pattern</td>
                    <td>Slug</td>
					<td style={{width: 200}}>Customized</td>
                </tr>
            </thead>
            <tbody>
                { syncedPatterns?.map( ( syncedPattern ) => {
                    if (syncedPattern.meta.wp_pattern_sync_status !== "unsynced") {
                        console.log(syncedPattern);
                        return (
                            <tr key={ syncedPattern.id }>
                                <td>{ decodeEntities( syncedPattern.title.raw ) }</td>
                                <td>{ syncedPattern.slug }</td>
                                <td>User Generated</td>
                            </tr>
                        );
                    }
                })}
            </tbody>
        </table>
    );
}

 
window.addEventListener(
    'load',
    function () {
        render(
            <FSECustomizationChecker />,
            document.querySelector( '#fse-customization-checker' )
        );
    },
    false
);
