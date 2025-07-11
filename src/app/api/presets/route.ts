import { NextRequest, NextResponse } from 'next/server';
import { getPresets, createPreset, updatePreset, deletePreset } from '@/lib/presets';
import { Member } from '@/lib/types';

// プリセット一覧を取得
export async function GET() {
  try {
    const presets = await getPresets();
    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Error getting presets:', error);
    return NextResponse.json(
      { error: 'プリセットの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// プリセットを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, members } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'プリセット名が必要です' },
        { status: 400 }
      );
    }

    if (!Array.isArray(members)) {
      return NextResponse.json(
        { error: 'メンバーリストが必要です' },
        { status: 400 }
      );
    }

    // メンバーの検証
    for (const member of members) {
      if (!member.name || typeof member.name !== 'string') {
        return NextResponse.json(
          { error: 'すべてのメンバーに名前が必要です' },
          { status: 400 }
        );
      }
    }

    const preset = await createPreset(name.trim(), members as Member[]);

    if (!preset) {
      return NextResponse.json(
        { error: 'プリセットの作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ preset });
  } catch (error) {
    console.error('Error creating preset:', error);

    if (error instanceof Error && error.message === '同じ名前のプリセットが既に存在します') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'プリセットの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// プリセットを更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, members } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'プリセットIDが必要です' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'プリセット名が必要です' },
        { status: 400 }
      );
    }

    if (!Array.isArray(members)) {
      return NextResponse.json(
        { error: 'メンバーリストが必要です' },
        { status: 400 }
      );
    }

    // メンバーの検証
    for (const member of members) {
      if (!member.name || typeof member.name !== 'string') {
        return NextResponse.json(
          { error: 'すべてのメンバーに名前が必要です' },
          { status: 400 }
        );
      }
    }

    const success = await updatePreset(id, name.trim(), members as Member[]);

    if (!success) {
      return NextResponse.json(
        { error: 'プリセットが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating preset:', error);

    if (error instanceof Error && error.message === '同じ名前のプリセットが既に存在します') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'プリセットの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// プリセットを削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'プリセットIDが必要です' },
        { status: 400 }
      );
    }

    const success = await deletePreset(id);

    if (!success) {
      return NextResponse.json(
        { error: 'プリセットが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json(
      { error: 'プリセットの削除に失敗しました' },
      { status: 500 }
    );
  }
}
