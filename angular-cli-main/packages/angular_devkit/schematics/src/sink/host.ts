/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Path, virtualFs } from '@angular-devkit/core';
import {
  EMPTY,
  Observable,
  concat as concatObservables,
  from as observableFrom,
  of as observableOf,
} from 'rxjs';
import { concatMap, reduce } from 'rxjs/operators';
import { CreateFileAction } from '../tree/action';
import { UpdateBufferBase } from '../utility/update-buffer';
import { SimpleSinkBase } from './sink';

export class HostSink extends SimpleSinkBase {
  protected _filesToDelete = new Set<Path>();
  protected _filesToRename = new Set<[Path, Path]>();
  protected _filesToCreate = new Map<Path, UpdateBufferBase>();
  protected _filesToUpdate = new Map<Path, UpdateBufferBase>();

  constructor(protected _host: virtualFs.Host, protected _force = false) {
    super();
  }

  protected override _validateCreateAction(action: CreateFileAction): Observable<void> {
    return this._force ? EMPTY : super._validateCreateAction(action);
  }

  protected _validateFileExists(p: Path): Observable<boolean> {
    if (this._filesToCreate.has(p) || this._filesToUpdate.has(p)) {
      return observableOf(true);
    }

    if (this._filesToDelete.has(p)) {
      return observableOf(false);
    }

    for (const [from, to] of this._filesToRename.values()) {
      switch (p) {
        case from:
          return observableOf(false);
        case to:
          return observableOf(true);
      }
    }

    return this._host.exists(p);
  }

  protected _overwriteFile(path: Path, content: Buffer): Observable<void> {
    this._filesToUpdate.set(path, UpdateBufferBase.create(content));

    return EMPTY;
  }
  protected _createFile(path: Path, content: Buffer): Observable<void> {
    this._filesToCreate.set(path, UpdateBufferBase.create(content));

    return EMPTY;
  }
  protected _renameFile(from: Path, to: Path): Observable<void> {
    this._filesToRename.add([from, to]);

    return EMPTY;
  }
  protected _deleteFile(path: Path): Observable<void> {
    if (this._filesToCreate.has(path)) {
      this._filesToCreate.delete(path);
      this._filesToUpdate.delete(path);
    } else {
      this._filesToDelete.add(path);
    }

    return EMPTY;
  }

  _done() {
    // Really commit everything to the actual filesystem.
    return concatObservables(
      observableFrom([...this._filesToDelete.values()]).pipe(
        concatMap((path) => this._host.delete(path)),
      ),
      observableFrom([...this._filesToRename.entries()]).pipe(
        concatMap(([_, [path, to]]) => this._host.rename(path, to)),
      ),
      observableFrom([...this._filesToCreate.entries()]).pipe(
        concatMap(([path, buffer]) => {
          return this._host.write(path, buffer.generate() as {} as virtualFs.FileBuffer);
        }),
      ),
      observableFrom([...this._filesToUpdate.entries()]).pipe(
        concatMap(([path, buffer]) => {
          return this._host.write(path, buffer.generate() as {} as virtualFs.FileBuffer);
        }),
      ),
    ).pipe(reduce(() => {}));
  }
}
